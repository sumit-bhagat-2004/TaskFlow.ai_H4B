import { Project } from "../models/project.js";
import { User } from "../models/user.js";
import { Task } from "../models/task.js";
import { analyzeAndAllocateTask } from "../utils/ai.js";
import { sendTaskNotificationEmail } from "../utils/mailer.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, projectId } = req.body;

    if (!title || !description || !projectId) {
      return res.status(400).json({
        error: "Title, description, and project ID are required.",
      });
    }

    const aiAnalysis = await analyzeAndAllocateTask(title, description);

    if (!aiAnalysis) {
      return res.status(500).json({
        error: "AI analysis failed or returned an invalid response.",
      });
    }

    const summary = aiAnalysis.summary || "No summary provided by AI.";
    const priority = (aiAnalysis.priority || "medium").toLowerCase();
    const notes = aiAnalysis.notes || [];
    const skills = aiAnalysis.technical_skills || [];

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    const members = await User.find({
      _id: { $in: project.members },
      position: { $ne: "project manager" },
    });

    // Find the user with the most matching skills
    let bestMatch = null;
    let maxMatches = -1;

    for (const user of members) {
      if (!user.skills || user.skills.length === 0) continue;
      const matches = user.skills.filter((userSkill) =>
        skills.map((s) => s.toLowerCase()).includes(userSkill.toLowerCase())
      ).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = user;
      }
    }

    const assignedToUser = bestMatch;
    const assignedToUserId = assignedToUser ? assignedToUser._id : null;

    if (!assignedToUserId) {
      return res.status(400).json({
        error:
          "No eligible user found to assign this task (check members and skills).",
      });
    }

    // Create the task
    const task = await Task.create({
      name: title,
      description,
      projectId,
      summary,
      priority,
      notes,
      skills,
      assignedTo: assignedToUserId,
    });

    // --- Send email notification ---
    if (assignedToUser && assignedToUser.email && task.name) {
      await sendTaskNotificationEmail(assignedToUser.email, task.name);
    } else {
      console.warn(
        "Could not send task notification email: Missing assigned user details (email) or task name."
      );
    }

    return res.status(201).json({
      message: "Task created and assigned successfully!",
      task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({
      error: "Failed to create task. Please try again later.",
      details: error.message,
    });
  }
};

export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required." });
    }

    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name email")
      .populate("projectId", "name");

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ error: "No tasks found for this project." });
    }

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const markTaskAsCompleted = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body; // Assuming userId is passed in the request body
    if (!taskId || !userId) {
      return res.status(400).json({
        error: "Task ID and user ID are required to mark a task as completed.",
      });
    }
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }
    if (task.status === "completed") {
      return res.status(400).json({ error: "Task is already completed." });
    }
    // Update the task status to completed
    task.status = "completed";
    await task.save();
    // Decrement numTasks for the user who completed the task
    await User.findByIdAndUpdate(
      userId,
      { $inc: { numTasks: -1 } },
      { new: true }
    );
    return res.status(200).json({ message: "Task marked as completed." });
  } catch (error) {
    console.error("Error marking task as completed:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
