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

  const [taskForm, setTaskForm] = useState({ title: "", description: "" });
  const [taskSuccess, setTaskSuccess] = useState("");
  const [taskError, setTaskError] = useState("");
  const [tasks, setTasks] = useState([]);

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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/projects/${id}`);
        setProject(res.data);
        fetchTasks(); // Fetch tasks for the project
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks/getTasksByProject/${id}`);
      setTasks(res.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/projects/${id}`);
      setProject(res.data);
      fetchTasks(); // Refresh tasks after adding a user
    } catch (err) {
      setAddError(err.response?.data?.error || "Failed to add user to project.");
    }
  };

  const handleTaskCreate = async (e) => {
    e.preventDefault();
    setTaskError("");
    setTaskSuccess("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/tasks/create`, {
        projectId: project._id,
        title: taskForm.title,
        description: taskForm.description,
      });
      setTaskSuccess("Task created successfully!");
      setTaskForm({ title: "", description: "" });
      setTasks([...tasks, res.data.task]);
    } catch (err) {
      setTaskError(err.response?.data?.error || "Failed to create task.");
    }
  };

  const handleMarkAsCompleted = async (taskId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/tasks/markAsCompleted/${taskId}`);
      setTasks(
        tasks.map((task) =>
          task._id === taskId ? { ...task, status: "completed" } : task
        )
      );
    } catch (error) {
      console.error("Error marking task as completed:", error);
    }
  };

  if (loading) return <div className="text-center p-8 text-white">Loading...</div>;
  if (!project)
    return <div className="text-center p-8 text-red-600">Project not found.</div>;

  const adminId = typeof project.admin === "object" ? project.admin._id : project.admin;
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
            <p className="text-white-300 text-base space-y-5">{project.description}</p>
            <div>
              <span className="font-semibold text-gray-200">📅 Deadline:</span>{" "}
              <span className="text-gray-400">
                {new Date(project.deadLine).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-200">🏢 Company ID:</span>{" "}
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
            <h3 className="text-xl font-semibold text-gray-200 mb-3">👥 Members</h3>
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

        {/* Task Creator */}
        <div className="mt-10 border-t border-gray-600 pt-6">
          <h3 className="text-2xl font-bold text-pink-500 mb-4">📋 Create Task</h3>
          <form onSubmit={handleTaskCreate} className="space-y-4">
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Task Title"
              className="w-full bg-black border border-gray-700 text-white px-4 py-2 rounded-lg"
              required
            />
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Task Description"
              className="w-full bg-black border border-gray-700 text-white px-4 py-2 rounded-lg"
              required
            ></textarea>
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg"
            >
              Create Task
            </button>
            {taskError && <p className="text-red-500 text-sm">{taskError}</p>}
            {taskSuccess && <p className="text-green-500 text-sm">{taskSuccess}</p>}
          </form>
        </div>

        {/* Task Display */}
        <div className="mt-10">
          <h3 className="text-xl font-bold text-white mb-4">🗂 Assigned Tasks</h3>
          {tasks.length > 0 ? (
            <ul className="space-y-4">
              {tasks.map((task, index) => (
                <li key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-pink-400">{task.title}</h4>
                  <p className="text-gray-300">{task.description}</p>
                  {task.assignedTo && (
                    <p className="text-sm text-gray-400 mt-2">Assigned to: {task.assignedTo.name || task.assignedTo.email || task.assignedTo}</p>
                  )}
                  {task.status !== "completed" && (
                    <button
                      onClick={() => handleMarkAsCompleted(task._id)}
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Mark as Completed
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No tasks created yet.</p>
          )}
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
            {addSuccess && <div className="text-green-600 mt-2">{addSuccess}</div>}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black border-pink-700 bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-zinc rounded-lg p-8 shadow-lg border-pink-700 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 border-pink-700">Add Employee</h3>
              <form onSubmit={handleAddUser}>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border px-3 py-2 rounded mb-4 bg-zinc-600"
                  required
                >
                  <option value="">Select user</option>
                  {eligibleUsers.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="bg-zinc-400 text-white px-4 py-2 rounded hover:bg-gray-600"
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
    </div>
  );
};

export default ProjectDetails;
