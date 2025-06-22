import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Employees = () => {
  const [rankings, setRankings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return navigate("/", { replace: true });

    axios
      .get("https://taskflow-ai-h4b-ttfu.onrender.com/ranking")
      .then((res) => setRankings(res.data))
      .catch((err) => console.error("Error fetching rankings:", err));
  }, [navigate]);

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
        🧑‍🏫 Employee Rankings
      </h1>

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
            <Link
              to={`/employee/${mentor._id}/profile`}
              className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-md text-sm font-medium"
            >
              View Profile →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employees;
