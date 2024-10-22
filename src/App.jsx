
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Hero } from "./components/Hero/Hero";
import { SmartSolutions } from "./components/SmartSolutions/SmartSolutions";
import {Smart_Building }from "./components/SmartSolutions/inSmartSolutions/Smart_Building";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/smart-solutions" element={<SmartSolutions />} />
        <Route path="/smart-solutions-building" element={<Smart_Building />} />
      </Routes>
    </Router>
  );
}

export default App;