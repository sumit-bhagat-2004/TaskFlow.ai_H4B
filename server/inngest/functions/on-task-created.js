import { NonRetriableError } from "inngest";
import Task from "../../models/task.js";
import { inngest } from "../client.js";
import analyzeTask from "../../utils/ai.js";
import User from "../../models/user.js";
import {
  sendTaskNotificationEmail,
  sendWelcomeEmail,
} from "../../utils/mailer.js";

export const onTaskCreated = inngest.createFunction(
  { id: "on-task-created", retries: 2 },
  { event: "task/created" },
  async ({ event, step }) => {
    try {
      const { taskId } = event.data;
      const task = await step.run("fetch-task", async () => {
        const taskObject = await Task.findById(taskId);
        if (!taskObject) {
          throw new NonRetriableError("Task not found");
        }
        return taskObject;
      });

      await step.run("update-task", async () => {
        await Task.findByIdAndUpdate(task._id, {
          status: "pending",
        });
      });

      const aiRes = await analyzeTask(task);

      const relatedSkills = await step.run("ai-processing", async () => {
        let skills = [];
        if (aiRes) {
          await Task.findByIdAndUpdate(task._id, {
            priority: !["low", "medium", "high"].includes(aiRes.priority)
              ? "medium"
              : aiRes.priority,
            helpfulNotes: aiRes.helpfulNotes,
            status: "in-progress",
            relatedSkills: aiRes.relatedSkills,
          });
          skills = aiRes.relatedSkills;
        }
        return skills;
      });

      // Find a user who is NOT a project manager, has matching skills, and numTasks < 3
      const assignee = await step.run("assign-employee", async () => {
        let user = await User.findOne({
          position: { $ne: "project manager" },
          skills: { $elemMatch: { $in: relatedSkills } },
          numTasks: { $lt: 3 },
        }).sort({ numTasks: 1 }); // Prefer user with least tasks

        // Fallback: assign to any moderator/admin with least tasks
        if (!user) {
          user = await User.findOne({
            position: { $in: ["moderator", "admin"] },
          }).sort({ numTasks: 1 });
        }

        if (user) {
          await Task.findByIdAndUpdate(task._id, {
            assignedTo: user._id,
          });
          // Increment numTasks for the assigned user
          user.numTasks = (user.numTasks || 0) + 1;
          await user.save();
        }

        return user;
      });

      await step.run("send-email-notification", async () => {
        if (assignee) {
          const finalTask = await Task.findById(task._id);
          await sendTaskNotificationEmail(assignee.email, `${finalTask.name}`);
          // Optionally, sendMail(assignee.email, "New Task Assigned", `Task: ${finalTask.name}`);
        }
      });

      return { success: true };
    } catch (error) {
      console.error("Error processing task", error.message);
      return { success: false };
    }
  }
);
