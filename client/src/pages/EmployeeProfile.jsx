import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return navigate("/", { replace: true });

    const fetchMentor = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/professionals/${id}`);
        setMentor(res.data);
      } catch (error) {
        console.error("Error fetching mentor details:", error);
      }
    };

    fetchMentor();
  }, [id, navigate]);

  if (!mentor) {
    return <div className="text-center text-white mt-20">Loading...</div>;
  }

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: "#0d0d0d", color: "#e5e5e5" }}
    >
      <h1 className="text-3xl font-bold text-white mb-6">{mentor.name}</h1>
      <p className="mb-4 text-gray-300">
        <strong className="text-gray-400">Skills:</strong> {mentor.skills.join(", ")}
      </p>
      <p className="mb-6 text-gray-300">
        <strong className="text-gray-400">Overall Score:</strong>{" "}
        <span className="text-white font-semibold">{mentor.overall_score}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-800 p-5 rounded-xl">
          <h3 className="text-white font-medium mb-2">Rating Parameters</h3>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>🧠 Expertise: {mentor.ratings.expertise[0]}</li>
            <li>🎯 Clarity: {mentor.ratings.clarity[0]}</li>
          </ul>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl">
          <h3 className="text-white font-medium mb-2">Soft Skills</h3>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>🗣️ Communication: {mentor.ratings.communication[0]}</li>
            <li>🤝 Mentorship: {mentor.ratings.mentorship[0]}</li>
          </ul>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-3">🔗 Projects Rated</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mentor.project_details.map((proj, idx) => (
          <div
            key={idx}
            className="bg-gray-700 p-4 rounded-md text-sm text-gray-200"
          >
            <p className="font-semibold">{proj.project_name}</p>
            <p className="text-gray-400">{proj.project_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeProfile;
