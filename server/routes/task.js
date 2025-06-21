import express from "express";
import { createTask } from "../controllers/task.js";

const router = express.Router();

router.post("/create", createTask);

export default router;
