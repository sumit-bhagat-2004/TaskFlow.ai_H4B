import express from "express";
import {
  createTask,
  getTasksByProject,
  markTaskAsCompleted,
} from "../controllers/task.js";

const router = express.Router();

router.post("/create", createTask);
router.get("/getTasksByProject/:projectId", getTasksByProject);
router.put("/markAsCompleted/:taskId", markTaskAsCompleted);

export default router;
