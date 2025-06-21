import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@civic/auth/react";

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Onboarding", path: "/onboarding" },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-white font-extrabold text-2xl tracking-tight">
              TaskFlow.ai
            </span>
          </Link>
          {/* Navigation Links */}
          <div className="flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-white font-medium hover:text-yellow-300 transition ${
                  location.pathname === link.path
                    ? "border-b-2 border-yellow-300"
                    : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {/* User Button */}
          <div>
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
