import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  useEffect(() => {
    // Get user _id from dashboard data in localStorage
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        // Fetch dashboard data to get MongoDB _id
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

  // Fetch eligible users when modal opens
  const fetchEligibleUsers = async () => {
    setAddError("");
    setAddSuccess("");
    if (!project?.companyId) return;
    try {
      // Fetch all users in the same company
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/getUsersByCompanyId`,
        { companyId: project.companyId }
      );
      if (res.data?.users) {
        // Exclude project managers and already added members
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
    if (!selectedUser) {
      setAddError("Please select a user.");
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/projects/add-member`, {
        projectId: project._id,
        userId: selectedUser,
        adminId: userId,
      });
      setAddSuccess("User added to project!");
      setSelectedUser("");
      setShowModal(false);
      // Refresh project details
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

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!project)
    return (
      <div className="text-center p-8 text-red-600">Project not found.</div>
    );

  // Compare admin _id with userId
  const adminId =
    typeof project.admin === "object" ? project.admin._id : project.admin;
  const isAdmin = userId && adminId && String(userId) === String(adminId);

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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Employee</h3>
            <form onSubmit={handleAddUser}>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4"
                required
              >
                <option value="">Select user</option>
                {eligibleUsers.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
              {addError && <div className="text-red-600 mt-2">{addError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
