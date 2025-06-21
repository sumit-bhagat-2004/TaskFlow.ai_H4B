import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        axios
          .post(`${import.meta.env.VITE_API_URL}/company/getDashboardData`, {
            email: u.email,
          })
          .then((res) => {
            if (res.data?.user?._id) setUserId(res.data.user._id);
          });
      } catch {
        setUserId(null);
      }
    }
  }, []);

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

  const fetchEligibleUsers = async () => {
    setAddError("");
    setAddSuccess("");
    if (!project?.companyId) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/getUsersByCompanyId`,
        { companyId: project.companyId }
      );
      if (res.data?.users) {
        const memberIds = project.members.map((m) => m._id || m);
        const eligible = res.data.users.filter(
          (emp) =>
            emp.position.toLowerCase() !== "project manager" &&
            !memberIds.includes(emp._id)
        );
        setEligibleUsers(eligible);
      }
    } catch {
      setEligibleUsers([]);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    if (!selectedUser) return setAddError("Please select a user.");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/projects/add-member`, {
        projectId: project._id,
        userId: selectedUser,
        adminId: userId,
      });
      setAddSuccess("User added to project!");
      setSelectedUser("");
      setShowModal(false);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/projects/${id}`
      );
      setProject(res.data);
    } catch (err) {
      setAddError(
        err.response?.data?.error || "Failed to add user to project."
      );
    }
  };

  if (loading)
    return <div className="text-center p-8 text-white">Loading...</div>;
  if (!project)
    return (
      <div className="text-center p-8 text-red-600">Project not found.</div>
    );

  const adminId =
    typeof project.admin === "object" ? project.admin._id : project.admin;
  const isAdmin = userId && adminId && String(userId) === String(adminId);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse delay-[200ms]" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-pink-500 opacity-20 rounded-full blur-3xl animate-pulse delay-[500ms]" />

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto mt-10 p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 shadow-lg z-10">
        <h2 className="text-3xl font-extrabold mb-6 text-white border-b pb-2 border-gray-600">
          {project.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Project Info */}
          <div className="space-y-6">
            <p className="text-white-300 text-base space-y-5">
              {project.description}
            </p>
            <div>
              <span className="font-semibold text-gray-200">📅 Deadline:</span>{" "}
              <span className="text-gray-400">
                {new Date(project.deadLine).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-200">
                🏢 Company ID:
              </span>{" "}
              <span className="text-gray-400">{project.companyId}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-200">🧑 Admin:</span>{" "}
              <span className="text-gray-400">
                {project.admin?.name || project.admin}
              </span>
            </div>
          </div>

          {/* Right: Members */}
          <div className="ml-8">
            <h3 className="text-xl font-semibold text-gray-200 mb-3">
              👥 Members
            </h3>
            {project.members && project.members.length > 0 ? (
              <ul className="space-y-4">
                {project.members.map((m, index) => (
                  <li key={index} className="flex items-center space-x-4">
                    {m.profile ? (
                      <img
                        src={m.profile}
                        alt={m.name}
                        className="w-10 h-10 rounded-full border border-gray-500 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white text-sm font-bold">
                        {m.name ? m.name[0].toUpperCase() : "?"}
                      </div>
                    )}
                    <span className="text-gray-300 text-sm font-medium">
                      {m.name || m}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">No members assigned.</p>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="mt-8">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => {
                setShowModal(true);
                fetchEligibleUsers();
              }}
            >
              Add Employee to Project
            </button>
            {addSuccess && (
              <div className="text-green-600 mt-2">{addSuccess}</div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-[#0f0f0f] border border-pink-500 rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-fade-in">
              <h3 className="text-2xl font-bold text-pink-500 mb-4 text-center">
                Add Employee
              </h3>

              <form onSubmit={handleAddUser} className="space-y-4">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-pink-500 transition-all"
                  required
                >
                  <option value="">Select user</option>
                  {eligibleUsers.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>

                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="flex-1 mr-2 bg-teal-800 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md shadow-pink-700/40"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="flex-1 ml-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition duration-200"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>

                {addError && (
                  <div className="text-teal-500 text-sm">{addError}</div>
                )}
                {addSuccess && (
                  <div className="text-green-400 text-sm">{addSuccess}</div>
                )}
              </form>

              {/* Optional: Close X Button */}
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-pink-500 text-lg font-bold"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;