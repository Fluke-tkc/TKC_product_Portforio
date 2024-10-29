
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Hero } from "./components/Hero/Hero";
import { SmartSolutions } from "./components/SmartSolutions/SmartSolutions";
import { GreenSolutions } from "./components/GreenSolution/GreenSolutions";

import {Smart_Building }from "./components/SmartSolutions/inSmartSolutions/Smart_Building";
import {Smart_Farm }from "./components/SmartSolutions/inSmartSolutions/Smart_Farm";
import {Smart_Hospital }from "./components/SmartSolutions/inSmartSolutions/Smart_Hospital";
import {Smart_Learning }from "./components/SmartSolutions/inSmartSolutions/Smart_Learning";
import {Smart_Logistics }from "./components/SmartSolutions/inSmartSolutions/Smart_Logistics";
import {Smart_Organized_Communication_Cables }from "./components/SmartSolutions/inSmartSolutions/Smart_Organized_Communication_Cables";
import {Smart_Platform }from "./components/SmartSolutions/inSmartSolutions/Smart_Platform";
import {Smart_Utility }from "./components/SmartSolutions/inSmartSolutions/Smart_Utility";


// import {GreenSolutionsDiscription }from "./components/GreenSolution/GreenSolutions_Discription";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/smart-solutions" element={<SmartSolutions />} />
             <Route path="/smart-solutions-building" element={<Smart_Building />} />
             <Route path="/smart-solutions-fram" element={<Smart_Farm />} />
             <Route path="/smart-solutions-hospital" element={<Smart_Hospital />} />
             <Route path="/smart-solutions-learning" element={<Smart_Learning />} />
             <Route path="/smart-solutions-logistics" element={<Smart_Logistics />} />
             <Route path="/smart-solutions-organized_communication_cables" element={<Smart_Organized_Communication_Cables />} />
             <Route path="/smart-solutions-platform" element={<Smart_Platform />} />
             <Route path="/smart-solutions-utility" element={<Smart_Utility />} />
        <Route path="/green-solutions" element={<GreenSolutions />} />
             {/* <Route path="/green-solutions-discription" element={<GreenSolutionsDiscription />} /> */}
      </Routes>
    </Router>
  );
}

export default App;