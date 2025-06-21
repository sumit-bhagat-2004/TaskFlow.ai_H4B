import { Project } from "../models/project.js";

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
