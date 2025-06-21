import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", deadLine: "" });
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
      await axios.post(`${import.meta.env.VITE_API_URL}/projects/create`, {
        name: form.name,
        description: form.description,
        deadLine: form.deadLine,
        companyId: dashboard.user?.companyId,
        adminId: dashboard.user?._id,
      });
      setShowProjectForm(false);
      setForm({ name: "", description: "", deadLine: "" });

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

  const containerStyles = "max-w-5xl mx-auto mt-10 p-8 rounded-xl shadow-xl";
  const cardStyles = "bg-[#1a1a1a] text-gray-200 border border-gray-700";
  const titleStyles = "text-2xl font-extrabold text-white mb-4";
  const subHeading = "text-xl font-semibold text-gray-100 mb-2";

  if (loading) return <div className="text-center text-white p-8">Loading...</div>;
  if (!dashboard)
    return <div className="text-center p-8 text-red-400">Failed to load dashboard.</div>;

  if (dashboard.type === "company") {
    return (
      <div className={`${containerStyles} ${cardStyles}`}>
        <h2 className={titleStyles}>{dashboard.company.name} (Dashboard)</h2>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={dashboard.company.logo}
            alt="Company Logo"
            className="h-16 w-16 rounded-full border border-gray-600"
          />
          <div>
            <div className="font-bold text-white">{dashboard.company.name}</div>
            <div className="text-gray-400">{dashboard.company.email}</div>
            <div className="text-sm text-gray-500">
              Company ID: {dashboard.company.companyId}
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className={subHeading}>Employees</h3>
          <ul className="list-disc ml-6 space-y-1">
            {dashboard.employees.map((emp) => (
              <li key={emp._id}>
                <span className="text-white font-medium">{emp.name}</span>{" "}
                <span className="text-gray-400">({emp.email}) - {emp.position}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={subHeading}>Projects</h3>
          <ul className="list-disc ml-6 space-y-1">
            {dashboard.projects.map((proj) => (
              <li key={proj._id}>
                <span className="font-medium text-white">{proj.name}</span> -{" "}
                <span className="text-gray-300">{proj.description}</span>{" "}
                <span className="text-sm text-gray-500">
                  (Deadline: {new Date(proj.deadLine).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (dashboard.type === "manager") {
    return (
      <div className={`${containerStyles} ${cardStyles}`}>
        <h2 className={titleStyles}>Project Manager Dashboard</h2>
        <div className="mb-6">
          <div className="text-white font-bold">{dashboard.user.name}</div>
          <div className="text-gray-400">{dashboard.user.email}</div>
        </div>
        <button
          className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
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
              className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleProjectChange}
              required
              className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded"
            />
            <input
              name="deadLine"
              type="date"
              value={form.deadLine}
              onChange={handleProjectChange}
              required
              className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Project
            </button>
            {error && <div className="text-red-400 mt-2">{error}</div>}
          </form>
        )}
        <h3 className={subHeading}>Your Projects</h3>
        <ul className="space-y-2">
          {dashboard.projects.map((p) => (
            <li key={p._id} className="border-b border-gray-600 py-2">
              <Link
                to={`/project/${p._id}`}
                className="text-sky-400 hover:underline font-semibold"
              >
                {p.name}
              </Link>{" "}
              - <span className="text-gray-300">{p.description}</span>{" "}
              <span className="text-sm text-gray-500">
                (Deadline: {new Date(p.deadLine).toLocaleDateString()})
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (dashboard.type === "member") {
    return (
      <div className={`${containerStyles} ${cardStyles}`}>
        <h2 className={titleStyles}>Your Projects</h2>
        <div className="mb-6">
          <div className="font-bold text-white">{dashboard.user.name}</div>
          <div className="text-gray-400">{dashboard.user.email}</div>
        </div>
        <ul className="space-y-2">
          {dashboard.projects.map((p) => (
            <li key={p._id} className="border-b border-gray-600 py-2">
              <Link
                to={`/project/${p._id}`}
                className="text-sky-400 hover:underline font-semibold"
              >
                {p.name}
              </Link>{" "}
              - <span className="text-gray-300">{p.description}</span>{" "}
              <span className="text-sm text-gray-500">
                (Deadline: {new Date(p.deadLine).toLocaleDateString()})
              </span>
            </li>
          ))}
        </ul>

        <h3 className={`${subHeading} mt-6`}>Your Tasks</h3>
        <ul className="space-y-2">
          {dashboard.tasks && dashboard.tasks.length > 0 ? (
            dashboard.tasks.map((t) => (
              <li key={t._id} className="border-b border-gray-600 py-2 text-gray-300">
                <span className="font-semibold text-white">{t.name}</span> - {t.description}
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
      <span className="text-lg text-red-500">Unknown dashboard type.</span>
    </div>
  );
};

export default Dashboard;
