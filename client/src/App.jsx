import { CivicAuthProvider, UserButton, useUser } from "@civic/auth/react";
import axios from "axios";
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

// Dummy pages for demonstration
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";

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
    <div>
      <UserButton />
    </div>
  );
};

const App = () => (
  <CivicAuthProvider clientId={import.meta.env.VITE_CIVIC_AUTH_CLIENT_ID}>
    <Router>
      <Routes>
        <Route path="/" element={<AuthHandler />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </Router>
  </CivicAuthProvider>
);

export default App;
