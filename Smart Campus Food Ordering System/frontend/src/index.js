import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./App.css";
import { LanguageProvider } from "./Components/Website/Language/LanguageContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <LanguageProvider>
    <BrowserRouter>
      <div className="layout">
        <App />
      </div>
    </BrowserRouter>
  </LanguageProvider>
);