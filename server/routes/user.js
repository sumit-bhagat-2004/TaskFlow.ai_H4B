import express from "express";
import { check, onboardUser } from "../controllers/user.js";

const router = express.Router();

router.post("/check", check);
router.post("/onboardUser", onboardUser);

export default router;
