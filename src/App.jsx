import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Hero } from "./components/Hero/Hero";
import { Navbar } from "./components/Navbar/Navbar"; // นำเข้า Navbar
import {SmartSolutions }from "./components/page/SmartSolutions";

function App() {
  return (
    <Router>
      <Navbar /> {/* วาง Navbar ไว้ที่นี่เพื่อให้แสดงในทุกหน้า */}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/smart-solutions" element={<SmartSolutions />} />
      </Routes>
    </Router>
  );
}

export default App;
