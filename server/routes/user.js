import express from "express";
import {
  check,
  onboardUser,
  getUsersByCompanyId,
} from "../controllers/user.js";

const router = express.Router();

router.post("/check", check);
router.post("/onboardUser", onboardUser);
router.post("/getUsersByCompanyId", getUsersByCompanyId);

export default router;
