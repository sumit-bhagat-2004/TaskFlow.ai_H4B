import { Company } from "../models/company.js";
import { User } from "../models/user.js";
import { sendWelcomeEmail } from "../utils/mailer.js";

export const check = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    const company = await Company.findOne({ email });

    // If neither exists, go to onboarding
    if (!user && !company) {
      return res.status(404).json({
        message: "User or Company not found",
        redirect: "/onboarding",
      });
    }

    // If user exists and is not onboarded
    if (user && user.isOnboarded === false) {
      return res.status(200).json({ redirect: "/onboarding" });
    }

    // If company exists and is not onboarded
    if (company && company.isOnboarded === false) {
      return res.status(200).json({ redirect: "/onboarding" });
    }

    // If either is onboarded
    return res.status(200).json({ redirect: "/dashboard" });
  } catch (error) {
    console.error("Error in check:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const onboardUser = async (req, res) => {
  try {
    const { name, email, companyId, skills, position, experience } = req.body;

    if (!name || !email || !companyId || !position || !experience) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if company with provided companyId exists
    const company = await Company.findOne({ companyId });
    if (!company) {
      return res
        .status(400)
        .json({ message: "Invalid company ID. No such company exists." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isOnboarded) {
        return res.status(400).json({ message: "User already onboarded" });
      }
      // Update existing user and set isOnboarded true
      existingUser.name = name;
      existingUser.companyId = companyId;
      existingUser.skills = skills || [];
      existingUser.position = position;
      existingUser.experience = experience;
      existingUser.isOnboarded = true;
      await existingUser.save();
      await sendWelcomeEmail(email, name);
      return res
        .status(200)
        .json({ message: "User onboarded successfully", user: existingUser });
    }

    // New user
    const newUser = new User({
      name,
      email,
      companyId,
      skills: skills || [],
      position,
      experience,
      isOnboarded: true,
    });

    await newUser.save();
    await sendWelcomeEmail(email, name);

    return res
      .status(201)
      .json({ message: "User onboarded successfully", user: newUser });
  } catch (error) {
    console.error("Error in onboardUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
