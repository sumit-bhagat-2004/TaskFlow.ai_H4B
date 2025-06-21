import React, { useEffect, useState } from "react";
import axios from "axios";


const Employees = () => {
  const [rankings, setRankings] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const navigate = useNavigate();
  
    useEffect(() => {
      const user = localStorage.getItem("user");
      if (!user) {
        navigate("/", { replace: true });
      }
    }, [navigate]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/ranking")
      .then((res) => setRankings(res.data))
      .catch((err) => console.error("Error fetching rankings:", err));
  }, []);

  const handleSelectMentor = async (mentorId) => {
    try {
      const res = await axios.get(`http://localhost:3000/professionals/${mentorId}`);
      setSelectedMentor(res.data);
    } catch (error) {
      console.error("Error fetching mentor details:", error);
    }
  };

  return (
    <div
      className="min-h-screen px-6 py-8"
      style={{
        backgroundColor: "#0d0d0d",
        color: "#e5e5e5",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <h1 className="text-4xl font-black text-center mb-10 tracking-wide">
        🧑‍🏫 Mentor Rankings
      </h1>

      {/* RANKING GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rankings.map((mentor, index) => (
          <div
            key={mentor._id}
            className="p-5 rounded-2xl shadow-md border border-gray-700 hover:shadow-lg transition-transform transform hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
            }}
          >
            <h2 className="text-lg font-semibold mb-2">
              <span className="text-gray-400">#{index + 1}</span> {mentor.name}
            </h2>
            <p className="text-sm text-gray-300 mb-4">
              Avg Score: <span className="font-bold text-white">{mentor.overall_score}</span>
            </p>
            <button
              onClick={() => handleSelectMentor(mentor._id)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-md text-sm font-medium"
            >
              View Profile →
            </button>
          </div>
        ))}
      </div>

      {/* SELECTED MENTOR PROFILE */}
      {selectedMentor && (
        <div
          className="mt-14 p-8 rounded-2xl border border-gray-700 shadow-inner"
          style={{
            background: "linear-gradient(135deg, #1f1f1f, #292929)",
          }}
        >
          <h2 className="text-3xl font-bold mb-6 text-white">
            {selectedMentor.name}
          </h2>

          <p className="mb-4 text-gray-300">
            <strong className="text-gray-400">Skills:</strong> {selectedMentor.skills.join(", ")}
          </p>
          <p className="mb-6 text-gray-300">
            <strong className="text-gray-400">Overall Score:</strong>{" "}
            <span className="text-white font-semibold">
              {selectedMentor.overall_score}
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="bg-gray-800 p-5 rounded-xl">
              <h3 className="text-white font-medium mb-2">Rating Parameters</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>🧠 Expertise: {selectedMentor.ratings.expertise[0]}</li>
                <li>🎯 Clarity: {selectedMentor.ratings.clarity[0]}</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl">
              <h3 className="text-white font-medium mb-2">Soft Skills</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>🗣️ Communication: {selectedMentor.ratings.communication[0]}</li>
                <li>🤝 Mentorship: {selectedMentor.ratings.mentorship[0]}</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mb-3">🔗 Projects Rated</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedMentor.project_details.map((proj, idx) => (
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
      )}
    </div>
  );
};

export default Employees;
