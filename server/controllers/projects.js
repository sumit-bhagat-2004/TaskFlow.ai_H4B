import { Project } from "../models/project.js";
import { User } from "../models/user.js";

export const createProject = async (req, res) => {
  const { name, description, companyId, adminId, deadLine } = req.body;

  try {
    if (!name || !description || !companyId || !adminId || !deadLine) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newProject = new Project({
      name,
      description,
      companyId,
      admin: adminId,
      deadLine,
      members: [adminId],
    });

    const savedProject = await newProject.save();

    return res.status(201).json(savedProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProjectById = async (req, res) => {
  const projectId = req.params.id;
  try {
    const project = await Project.findById(projectId)
      .populate("admin", "name email")
      .populate("members", "name email");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    return res.status(200).json(project);
  } catch (error) {
    error("Error fetching project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addMemberToProject = async (req, res) => {
  const { projectId, userId, adminId } = req.body;
  try {
    // Check if the requester is the admin of the project
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (String(project.admin) !== String(adminId))
      return res
        .status(403)
        .json({ error: "Only the project manager can add members" });

    // Check if the user to add is not a project manager
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.position && user.position.toLowerCase() === "project manager")
      return res
        .status(400)
        .json({ error: "Cannot add another project manager as member" });

    // Add user if not already a member
    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    return res.status(200).json({ message: "Member added", project });
  } catch (error) {
    console.error("Error adding member:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
