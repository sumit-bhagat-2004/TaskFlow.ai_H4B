import express from "express";
import { createProject, getProjectById } from "../controllers/projects.js";
import { get } from "mongoose";

const router = express.Router();

router.post("/create", createProject);
router.get("/:id", getProjectById);

export default router;
