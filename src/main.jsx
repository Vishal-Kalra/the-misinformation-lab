import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/intro.css";
import "./styles/phase1.css";
import "./styles/phase2.css";
import "./styles/phase3.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
