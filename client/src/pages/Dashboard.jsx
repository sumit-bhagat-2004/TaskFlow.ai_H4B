import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    deadLine: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/", { replace: true });

    let u;
    try {
      u = JSON.parse(stored);
    } catch {
      localStorage.removeItem("user");
      return navigate("/", { replace: true });
    }

    if (!u.email) {
      localStorage.removeItem("user");
      return navigate("/", { replace: true });
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/company/getDashboardData`,
          { email: u.email }
        );
        setDashboard(res.data);
      } catch {
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleProjectChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/user/projects/create`, {
        name: form.name,
        description: form.description,
        deadLine: form.deadLine,
        companyId: dashboard.user?.companyId,
        Admin: dashboard.user?._id,
        members: [dashboard.user?._id],
      });
      setShowProjectForm(false);
      setForm({ name: "", description: "", deadLine: "" });
      // Refresh dashboard
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : {};
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/company/getDashboardData`,
        { email: u.email }
      );
      setDashboard(res.data);
    } catch (err) {
      setError("Failed to create project.");
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!dashboard)
    return (
      <div className="text-center p-8 text-red-600">
        Failed to load dashboard.
      </div>
    );

  // Company Dashboard
  if (dashboard.type === "company") {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">
          {dashboard.company.name} (Company Dashboard)
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={dashboard.company.logo}
            alt="Company Logo"
            className="h-16 w-16 rounded-full border"
          />
          <div>
            <div className="font-semibold">{dashboard.company.name}</div>
            <div className="text-gray-500">{dashboard.company.email}</div>
            <div className="text-gray-400 text-sm">
              Company ID: {dashboard.company.companyId}
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Employees</h3>
          <ul className="list-disc ml-6">
            {dashboard.employees.map((emp) => (
              <li key={emp._id}>
                {emp.name} ({emp.email}) - {emp.position}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Projects</h3>
          <ul className="list-disc ml-6">
            {dashboard.projects.map((proj) => (
              <li key={proj._id}>
                <span className="font-medium">{proj.name}</span> -{" "}
                {proj.description} (Deadline:{" "}
                {new Date(proj.deadLine).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Project Manager Dashboard
  if (dashboard.type === "manager") {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Project Manager Dashboard</h2>
        <div className="mb-6">
          <div className="font-semibold">{dashboard.user.name}</div>
          <div className="text-gray-500">{dashboard.user.email}</div>
        </div>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowProjectForm((v) => !v)}
        >
          {showProjectForm ? "Cancel" : "Create New Project"}
        </button>
        {showProjectForm && (
          <form onSubmit={handleProjectSubmit} className="mb-6 space-y-3">
            <input
              name="name"
              placeholder="Project Name"
              value={form.name}
              onChange={handleProjectChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleProjectChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
            <input
              name="deadLine"
              type="date"
              value={form.deadLine}
              onChange={handleProjectChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Project
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </form>
        )}
        <h3 className="text-xl font-semibold mb-2">Your Projects</h3>
        <ul>
          {dashboard.projects.map((p) => (
            <li key={p._id} className="border-b py-2">
              <strong>{p.name}</strong> - {p.description} (Deadline:{" "}
              {new Date(p.deadLine).toLocaleDateString()})
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Member Dashboard
  if (dashboard.type === "member") {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
        <div className="mb-6">
          <div className="font-semibold">{dashboard.user.name}</div>
          <div className="text-gray-500">{dashboard.user.email}</div>
        </div>
        <ul>
          {dashboard.projects.map((p) => (
            <li key={p._id} className="border-b py-2">
              <strong>{p.name}</strong> - {p.description} (Deadline:{" "}
              {new Date(p.deadLine).toLocaleDateString()})
            </li>
          ))}
        </ul>
        <h3 className="text-xl font-semibold mt-6 mb-2">Your Tasks</h3>
        <ul>
          {dashboard.tasks && dashboard.tasks.length > 0 ? (
            dashboard.tasks.map((t) => (
              <li key={t._id} className="border-b py-2">
                <span className="font-medium">{t.name}</span> - {t.description}{" "}
                <br />
                <span className="text-sm text-gray-500">
                  Project: {t.project?.name} | Status: {t.status} | Updated:{" "}
                  {new Date(t.updatedAt).toLocaleDateString()}
                </span>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No tasks assigned.</li>
          )}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-64">
      <span className="text-lg text-red-600">Unknown dashboard type.</span>
    </div>
  );
};

export default Dashboard;
