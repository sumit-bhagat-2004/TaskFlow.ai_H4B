import { Company } from "../models/company.js";
import { Project } from "../models/project.js";
import { User } from "../models/user.js";
import { Task } from "../models/task.js";
import { sendWelcomeEmail } from "../utils/mailer.js";

export const onboardCompany = async (req, res) => {
  try {
    const { name, email, companyId, logo } = req.body;

    if (!name || !email || !companyId || !logo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingCompany = await Company.findOne({ email });

    if (existingCompany) {
      if (existingCompany.isOnboarded) {
        return res.status(400).json({ message: "Company already onboarded" });
      }
      // Update existing company and set isOnboarded true
      existingCompany.name = name;
      existingCompany.companyId = companyId;
      existingCompany.logo = logo;
      existingCompany.isOnboarded = true;
      await existingCompany.save();
      await sendWelcomeEmail(email, name);
      return res.status(200).json({
        message: "Company onboarded successfully",
        company: existingCompany,
      });
    }

    // New company
    const newCompany = new Company({
      name,
      email,
      companyId,
      logo,
      isOnboarded: true,
    });

    await newCompany.save();

    await sendWelcomeEmail(email, name);
    return res
      .status(201)
      .json({ message: "Company onboarded successfully", company: newCompany });
  } catch (error) {
    console.error("Error in onboardCompany:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getDashBoardData = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 1. Check if company exists
    const company = await Company.findOne({ email });
    if (company) {
      const projects = await Project.find({ companyId: company.companyId });
      const employees = await User.find({ companyId: company.companyId });
      return res.status(200).json({
        type: "company",
        company,
        projects,
        employees,
      });
    }

    // 2. Check if user exists
    const user = await User.findOne({ email });
    if (user) {
      if (user.position && user.position.toLowerCase() === "project manager") {
        // Project manager: get projects where admin is this user
        const projects = await Project.find({ admin: user._id });
        return res.status(200).json({
          type: "manager",
          user,
          projects,
        });
      } else {
        // Normal user: get projects where user is a member
        const projects = await Project.find({ members: user._id });

        // Get all tasks assigned to this user using aggregation
        const tasks = await Task.aggregate([
          {
            $match: { assignedTo: user._id },
          },
          {
            $lookup: {
              from: "projects",
              localField: "projectId",
              foreignField: "_id",
              as: "project",
            },
          },
          {
            $unwind: "$project",
          },
          {
            $project: {
              name: 1,
              description: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1,
              project: {
                _id: 1,
                name: 1,
                deadLine: 1,
              },
            },
          },
        ]);

        return res.status(200).json({
          type: "member",
          user,
          projects,
          tasks,
        });
      }
    }

    // 3. Not found
    return res.status(404).json({ message: "No such company or user exists" });
  } catch (error) {
    console.error("Error in getDashBoardData:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
