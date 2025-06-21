import express from "express";
import { getDashBoardData, onboardCompany } from "../controllers/company.js";

const router = express.Router();

router.post("/onboardCompany", onboardCompany);
router.post("/getDashboardData", getDashBoardData);

export default router;
