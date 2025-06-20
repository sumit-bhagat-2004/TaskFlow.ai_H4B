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

  // Prefill name, email, and id when user is available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        companyId: type === "company" ? user.id || "" : "",
      }));
    }
    // eslint-disable-next-line
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
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Onboarding</h2>
      <div className="flex justify-center mb-6">
        <label className="mr-6 flex items-center">
          <input
            type="radio"
            value="user"
            checked={type === "user"}
            onChange={handleTypeChange}
            className="mr-2"
          />
          <span>User</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="company"
            checked={type === "company"}
            onChange={handleTypeChange}
            className="mr-2"
          />
          <span>Company</span>
        </label>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name*</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email*</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        </div>
        {type === "user" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Company ID*
            </label>
            <input
              name="companyId"
              value={form.companyId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {type === "company" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Company ID*
            </label>
            <input
              name="companyId"
              value={user?.id || ""}
              readOnly
              disabled
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
            />
          </div>
        )}
        {type === "user" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Skills (comma separated)
              </label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Position*
              </label>
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Experience (years)*
              </label>
              <input
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                required
                min={0}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
        {type === "company" && (
          <div>
            <label className="block text-sm font-medium mb-1">Logo URL*</label>
            <input
              name="logo"
              value={user.picture}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Onboard
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
