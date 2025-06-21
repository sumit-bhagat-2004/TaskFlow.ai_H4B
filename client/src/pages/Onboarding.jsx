import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "@civic/auth/react";

const Onboarding = () => {
  const { user } = useUser();
  const [type, setType] = useState("user");
  const [form, setForm] = useState({
    name: "",
    email: "",
    companyId: "",
    logo: "",
    skills: "",
    position: "",
    experience: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboarded = async () => {
      if (!user?.email) return;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/user/check`,
          { email: user.email }
        );
        if (res.data.redirect === "/dashboard") {
          navigate("/dashboard");
        }
      } catch {}
    };
    checkOnboarded();
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        companyId: type === "company" ? user.id || "" : "",
      }));
    }
  }, [user, type]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setForm((prev) => ({
      ...prev,
      companyId: e.target.value === "company" && user ? user.id || "" : "",
      logo: "",
      skills: "",
      position: "",
      experience: "",
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (type === "user") {
        await axios.post(`${import.meta.env.VITE_API_URL}/user/onboardUser`, {
          name: form.name,
          email: form.email,
          companyId: form.companyId,
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          position: form.position,
          experience: Number(form.experience),
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/company/onboardCompany`,
          {
            name: form.name,
            email: form.email,
            companyId: user.id,
            logo: user.picture || form.logo,
          }
        );
      }
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Onboarding failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 py-12 text-white font-sans">
      <div className="w-full max-w-md bg-[#1e1e2f] rounded-3xl p-8 shadow-2xl border border-purple-700">
        <h2 className="text-3xl font-extrabold text-center mb-6 tracking-wide">
          Welcome to the Crew 🚀
        </h2>

        <div className="flex justify-center gap-6 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="user"
              checked={type === "user"}
              onChange={handleTypeChange}
              className="accent-purple-500"
            />
            <span>Employee</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="company"
              checked={type === "company"}
              onChange={handleTypeChange}
              className="accent-pink-500"
            />
            <span>Company</span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled
              required
              placeholder="Full Name"
              className="w-full bg-transparent border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled
              required
              placeholder="Email"
              className="w-full bg-transparent border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {type === "user" && (
            <>
              <input
                name="companyId"
                value={form.companyId}
                onChange={handleChange}
                placeholder="Company ID*"
                required
                className="w-full bg-transparent border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="Skills (comma separated)"
                className="w-full bg-transparent border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                placeholder="Position"
                className="w-full bg-transparent border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                name="experience"
                type="number"
                min={0}
                value={form.experience}
                onChange={handleChange}
                required
                placeholder="Experience (years)"
                className="w-full bg-transparent border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </>
          )}
          {type === "company" && (
            <>
              <input
                name="companyId"
                value={user?.id || ""}
                readOnly
                disabled
                className="w-full bg-gray-700 border border-gray-500 rounded-lg px-4 py-3"
              />
              <input
                name="logo"
                value={user.picture}
                onChange={handleChange}
                placeholder="Company Logo URL"
                required
                className="w-full bg-transparent border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </>
          )}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 py-3 rounded-lg text-white font-bold hover:scale-105 transition-all duration-300"
          >
            🚀 Let’s Go
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
