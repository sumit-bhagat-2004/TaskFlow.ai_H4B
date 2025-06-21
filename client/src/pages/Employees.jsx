import React, { useEffect, useState } from "react";
import axios from "axios";

const Employees = () => {
  const [rankings, setRankings] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);

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
    <div className="min-h-screen p-6 bg-base-200">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-500">
        🌟 Mentor Rankings
      </h1>

      {/* RANKING BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rankings.map((mentor, index) => (
          <div
            key={mentor._id}
            className="p-6 rounded-2xl shadow-xl border border-green-400 backdrop-blur-sm bg-white bg-opacity-80 hover:scale-105 transition-transform duration-300"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              #{index + 1} — {mentor.name}
            </h2>
            <p className="text-md font-medium text-gray-700 mb-4">
              Score: <span className="text-green-600 font-bold">{mentor.overall_score}</span>
            </p>
            <button
              className="btn btn-sm font-semibold px-4 py-2 text-white bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500 border-none rounded-full"
              onClick={() => handleSelectMentor(mentor._id)}
            >
              🔍 View Profile
            </button>
          </div>
        ))}
      </div>

      {/* MENTOR DETAIL CARD */}
      {selectedMentor && (
        <div
          className="mt-12 p-8 rounded-3xl shadow-2xl"
          style={{
            background:
              "linear-gradient(90deg, hsla(59, 86%, 68%, 1) 0%, hsla(134, 36%, 53%, 1) 100%)",
          }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
              {selectedMentor.name}
            </h2>
            <p className="mb-2 text-lg font-medium text-gray-700">
              <strong>Skills:</strong> {selectedMentor.skills.join(", ")}
            </p>
            <p className="mb-4 text-lg font-medium text-gray-700">
              <strong>Overall Score:</strong>{" "}
              <span className="bg-gray-200 px-2 py-1 rounded text-gray-900 font-semibold">
                {selectedMentor.overall_score}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 p-4 rounded-xl text-gray-800 font-medium">
                <p>Expertise: {selectedMentor.ratings.expertise[0]}</p>
                <p>Clarity: {selectedMentor.ratings.clarity[0]}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-xl text-gray-800 font-medium">
                <p>Communication: {selectedMentor.ratings.communication[0]}</p>
                <p>Mentorship: {selectedMentor.ratings.mentorship[0]}</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-800 underline">📁 Projects Rated</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMentor.project_details.map((proj, idx) => (
                <div
                  key={idx}
                  className="bg-gray-200 p-4 rounded-xl text-gray-800 border border-gray-300"
                >
                  <p className="font-bold">{proj.project_name}</p>
                  <p className="text-sm text-gray-600">{proj.project_id}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
