import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CivicAuthProvider } from "@civic/auth/react";

createRoot(document.getElementById("root")).render(
  <CivicAuthProvider clientId={import.meta.env.VITE_CIVIC_AUTH_CLIENT_ID}>
    <StrictMode>
      <App />
    </StrictMode>
  </CivicAuthProvider>
);
