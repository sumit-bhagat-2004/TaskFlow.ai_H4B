import express from "express";
import { onboardCompany } from "../controllers/company.js";

const router = express.Router();

router.post("/onboardCompany", onboardCompany);

export default router;
