import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@civic/auth/react";

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Employees", path: "/employees" },
    { name: "Meetings", path: "/meetings" },
  ];

  return (
    <nav className="bg-gradient-to-r from-black to-zinc-600 shadow-lg bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 bg-transparent">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-tight">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              TaskFlow.ai
            </h1>
            </span>
          </Link>
          {/* Navigation Links */}
          <div className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-white font-medium hover:text-yellow-300 transition  ${
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
