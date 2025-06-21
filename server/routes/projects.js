import express from "express";
import {
  createProject,
  getProjectById,
  addMemberToProject,
} from "../controllers/projects.js";

const router = express.Router();

router.post("/create", createProject);
router.get("/:id", getProjectById);
router.post("/add-member", addMemberToProject);

export default router;
