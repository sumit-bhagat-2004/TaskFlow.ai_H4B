import { CivicAuthProvider, UserButton, useUser } from "@civic/auth/react";
import axios from "axios";
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Link,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import { Target, ArrowRight } from "lucide-react";

// Dummy pages for demonstration
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import ProjectDetails from "./pages/ProjectDetails";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import Meetings from "./pages/Meetings";

const AuthHandler = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      if (!user?.email) return;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/user/check`,
          { email: user.email }
        );
        // Redirect based on backend response
        if (res.data.redirect === "/onboarding") {
          navigate("/onboarding");
        } else if (res.data.redirect === "/dashboard") {
          navigate("/dashboard");
        }
      } catch (err) {
        // If user/company not found, redirect to onboarding
        navigate("/onboarding");
      }
    };
    checkUser();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Animations */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse delay-200" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-pink-500 opacity-20 rounded-full blur-3xl animate-pulse delay-500" />

      {/* Hero Content */}
      <main className="z-10 flex-grow flex items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Supercharge Your Workflow with{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              TaskFlow.ai
            </span>
          </h2>
          <p className="text-gray-300 text-lg mb-10">
            AI-powered project management for next-gen teams. Automate tasks,
            collaborate effortlessly, and get real-time productivity insights.
          </p>
          <Link to="/">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-md hover:shadow-xl transition-all">
              Let’s Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <div className="mt-8 flex justify-center">
        <p className="text-gray-300 text-xl space-y-4 mb-10">
            AI-powered project management for next-gen teams. Automate tasks,
            collaborate effortlessly, and get real-time productivity insights.
          </p>
        </div>
        </div>
        
      </main>

      {/* Footer */}
      <footer className="z-10 border-t border-white/10 py-6 px-6 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 TaskFlow.ai. All rights reserved.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <Link to="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link to="/cookies" className="hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App = () => (
  <CivicAuthProvider
    onSignOut={() => navigate("/dashboard")}
    clientId={import.meta.env.VITE_CIVIC_AUTH_CLIENT_ID}
  >
    <Navbar />
    <Routes>
      <Route path="/" element={<AuthHandler />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/project/:id" element={<ProjectDetails />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/employee/:id/profile" element={<EmployeeProfile />} />
      <Route path="/meetings" element={<Meetings />} />
    </Routes>
  </CivicAuthProvider>
);

export default App;
