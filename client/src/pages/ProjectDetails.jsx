import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/projects/${id}`
        );
        setProject(res.data);
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!project)
    return (
      <div className="text-center p-8 text-red-600">Project not found.</div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
      <div className="mb-2 text-gray-700">{project.description}</div>
      <div className="mb-2">
        <span className="font-semibold">Deadline:</span>{" "}
        {new Date(project.deadLine).toLocaleDateString()}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Company ID:</span> {project.companyId}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Admin:</span>{" "}
        {project.admin?.name || project.admin}
      </div>
      <div>
        <span className="font-semibold">Members:</span>{" "}
        {project.members && project.members.length > 0
          ? project.members.map((m) => m.name || m).join(", ")
          : "None"}
      </div>
    </div>
  );
};

export default ProjectDetails;
