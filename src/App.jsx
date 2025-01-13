
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Hero } from "./components/Hero/Hero";
import { Hero_New } from "./components/Hero/Hero_New";
import { SmartSolutions } from "./components/SmartSolutions/SmartSolutions";
import { GreenSolutions } from "./components/GreenSolution/GreenSolutions";

import {Smart_Building }from "./components/SmartSolutions/inSmartSolutions/Smart_Building";
import {Smart_Farm }from "./components/SmartSolutions/inSmartSolutions/Smart_Farm";
// import {Smart_CloudService }from "./components/SmartSolutions/inSmartSolutions/Smart_CloudService";
import {Smart_Hospital }from "./components/SmartSolutions/inSmartSolutions/Smart_Hospital";
import {Smart_Learning }from "./components/SmartSolutions/inSmartSolutions/Smart_Learning";
import {Smart_Logistics }from "./components/SmartSolutions/inSmartSolutions/Smart_Logistics";
import {Smart_Organized_Communication_Cables }from "./components/SmartSolutions/inSmartSolutions/Smart_Organized_Communication_Cables";
import {Smart_Platform }from "./components/SmartSolutions/inSmartSolutions/Smart_Platform";
import {Smart_Utility }from "./components/SmartSolutions/inSmartSolutions/Smart_Utility";

import Smart_Building_New from "./components/SmartSolutions/SmartSolutions_Building_New";
import Smart_Building_New_Ver02 from "./components/SmartSolutions/SmartSolutions_Building_New_ver02";
import Smart_Utility_New from "./components/SmartSolutions/SmartSolutions_Utility_New";
import Smart_Utility_New_Ver02 from "./components/SmartSolutions/SmartSolutions_Utility_New_ver02";
import Smart_Hospital_New from "./components/SmartSolutions/SmartSolutions_Hospital_New";
import Smart_Hospital_New_Ver02 from "./components/SmartSolutions/SmartSolutions_Hospital_New_ver02";
import Smart_CloudService_New from "./components/SmartSolutions/SmartSolutions_CloudService_New";
import Smart_CloudService_New_Ver02 from "./components/SmartSolutions/SmartSolutions_CloudService_New_ver02";
import Smart_Organized_Communication_Cables_New from "./components/SmartSolutions/SmartSolutions_Organized_Communication_Cables_New";
import Smart_Organized_Communication_Cables_New_Ver02 from "./components/SmartSolutions/SmartSolutions_Organized_Communication_Cables_New_ver02";
import Smart_Autonomous_New from "./components/SmartSolutions/SmartSolutions_Autonomous_New";
import Smart_Autonomous_New_ver02 from "./components/SmartSolutions/SmartSolutions_Autonomous_New_ver02";
import Smart_Farm_New from "./components/SmartSolutions/SmartSolutions_Farm_New";
import Smart_Farm_New_Ver02 from "./components/SmartSolutions/SmartSolutions_Farm_New_ver02";
import Smart_CyberSecurity_New from "./components/SmartSolutions/SmartSolutions_CyberSecurity_New";
import Smart_CyberSecurity_New_Ver02 from "./components/SmartSolutions/SmartSolutions_CyberSecurity_New_ver02";
import Smart_Learning_New from "./components/SmartSolutions/SmartSolutions_Learning_New";
import Smart_Learning_New_Ver02 from "./components/SmartSolutions/SmartSolutions_Learning_New_ver02";
import Smart_Logistics_New from "./components/SmartSolutions/SmartSolutions_Logistics_New";
import Smart_Logistics_New_Ver02 from "./components/SmartSolutions/SmartSolutions_Logistics_New_ver02";
// import {GreenSolutionsDiscription }from "./components/GreenSolution/GreenSolutions_Discription";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero_New />} />
        <Route path="/smart-solutions" element={<SmartSolutions />} />
             <Route path="/smart-solutions-building" element={<Smart_Building />} />
                    <Route path="/smart-solutions-building_new" element={<Smart_Building_New />} />
                    <Route path="/smart-solutions-building_new_ver02" element={<Smart_Building_New_Ver02 />} />
             <Route path="/smart-solutions-fram" element={<Smart_Farm />} /> 
                    {/* <Route path="/smart-solutions-farm_new" element={<Smart_Farm_New />} />
                    <Route path="/smart-solutions-farm_new_ver02" element={<Smart_Farm_New_Ver02 />} /> */}
              <Route path="/smart-solutions-cybersecurity_new" element={<Smart_CyberSecurity_New />} />
                    <Route path="/smart-solutions-cybersecurity_new_ver02" element={<Smart_CyberSecurity_New_Ver02 />} />
             <Route path="/smart-solutions-hospital" element={<Smart_Hospital />} />
                    <Route path="/smart-solutions-hospital_new" element={<Smart_Hospital_New />} />
                    <Route path="/smart-solutions-hospital_new_ver02" element={<Smart_Hospital_New_Ver02 />} />
              {/* <Route path="/smart-solutions-cloudservice" element={<Smart_CloudService />} />  */}
                    <Route path="/smart-solutions-cloudservice_new" element={<Smart_CloudService_New />} />
                    <Route path="/smart-solutions-cloudservice_new_ver02" element={<Smart_CloudService_New_Ver02 />} />
                    <Route path="/smart-solutions_autonomous_new" element={<Smart_Autonomous_New />} />
                    <Route path="/smart-solutions_autonomous_new_ver02" element={<Smart_Autonomous_New_ver02 />} />
             <Route path="/smart-solutions-learning" element={<Smart_Learning />} />
                    {/* <Route path="/smart-solutions-learning_new" element={<Smart_Learning_New />} />
                    <Route path="/smart-solutions-learning_new_ver02" element={<Smart_Learning_New_Ver02 />} />  */}
             <Route path="/smart-solutions-logistics" element={<Smart_Logistics />} />
                   <Route path="/smart-solutions-logistics_new" element={<Smart_Logistics_New />} />
                    <Route path="/smart-solutions-logistics_new_ver02" element={<Smart_Logistics_New_Ver02 />} />
             <Route path="/smart-solutions-organized_communication_cables" element={<Smart_Organized_Communication_Cables />} />
                    <Route path="/smart-solutions-organized_communication_cables_new" element={<Smart_Organized_Communication_Cables_New />} />
                    <Route path="/smart-solutions-organized_communication_cables_new_ver02" element={<Smart_Organized_Communication_Cables_New_Ver02 />} />
             <Route path="/smart-solutions-platform" element={<Smart_Platform />} />
             <Route path="/smart-solutions-utility" element={<Smart_Utility />} />
                    <Route path="/smart-solutions-utility_new" element={<Smart_Utility_New />} />
                    <Route path="/smart-solutions-utility_new_ver02" element={<Smart_Utility_New_Ver02 />} />
        <Route path="/green-solutions" element={<GreenSolutions />} />
             {/* <Route path="/green-solutions-discription" element={<GreenSolutionsDiscription />} /> */}


             
      </Routes>
    </Router>
  );
}

export default App;