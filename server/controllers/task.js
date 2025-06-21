import { Task } from "../models/task.js";
import { inngest } from "../inngest/client.js";

// ...other imports...

export const createTask = async (req, res) => {
  try {
    const { name, description, projectId, priority } = req.body;
    // ...validate fields...

    const newTask = new Task({
      name,
      description,
      projectId,
      // assignedTo, status, etc. can be set by AI agent
    });
    const savedTask = await newTask.save();

    // Trigger Inngest event for AI agent
    await inngest.send({
      name: "task/created",
      data: { taskId: savedTask._id },
    });

    return res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
