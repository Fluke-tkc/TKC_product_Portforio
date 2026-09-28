
import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LEGACY_ROUTES } from "./data/legacyRoutes";
import { useLanguage } from './contexts/LanguageContext';


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

import Smart_Farm_New from "./components/SmartSolutions/SmartSolutions_Farm_New";
// import {GreenSolutionsDiscription }from "./components/GreenSolution/GreenSolutions_Discription";

//  import Test_TH from "./components/SmartSolutions/Test_TH";
//  import Test_EN from "./components/SmartSolutions/Test_EN";




const HomePage = lazy(() => import("./pages/HomePage"));
const SolutionPage = lazy(() => import("./pages/SolutionPage"));

function App() {

       const { setLanguageDirectly } = useLanguage();

       useEffect(() => {
         // ตรวจสอบ referrer URL
         const referrer = document.referrer;
         
         if (referrer) {
           try {
             const referrerUrl = new URL(referrer);
             const pathSegments = referrerUrl.pathname.split('/');
             
             // ตรวจสอบส่วนที่เป็นภาษาใน path
             const lang = pathSegments.find(segment => segment === 'th' || segment === 'en');
             
             if (lang) {
               setLanguageDirectly(lang); // ตั้งค่าภาษาตามเว็บต้นทาง
             }
           } catch (error) {
             console.error('Error parsing referrer URL:', error);
           }
         }
       }, [setLanguageDirectly]);


  return (
      
    <Router>
      <Suspense fallback={<div style={{ height: "100vh", background: "#04152d" }} />}>
      <Routes>
        <Route path="/solutions/:slug" element={<SolutionPage />} />
        {Object.entries(LEGACY_ROUTES).map(([path, slug]) => (
          <Route key={path} path={path} element={<Navigate to={`/solutions/${slug}`} replace />} />
        ))}

        <Route path="/" element={<HomePage />} />
        
        <Route path="/smart-solutions" element={<SmartSolutions />} />
             <Route path="/smart-solutions-building" element={<Smart_Building />} />
             <Route path="/smart-solutions-fram" element={<Smart_Farm />} /> 
                     <Route path="/smart-solutions-farm_new" element={<Smart_Farm_New />} />
                    {/* <Route path="/smart-solutions-farm_new_ver02" element={<Smart_Farm_New_Ver02 />} />  */}
             <Route path="/smart-solutions-hospital" element={<Smart_Hospital />} />
              {/* <Route path="/smart-solutions-cloudservice" element={<Smart_CloudService />} />  */}
             <Route path="/smart-solutions-learning" element={<Smart_Learning />} />
             <Route path="/smart-solutions-logistics" element={<Smart_Logistics />} />
             <Route path="/smart-solutions-organized_communication_cables" element={<Smart_Organized_Communication_Cables />} />
             <Route path="/smart-solutions-platform" element={<Smart_Platform />} />
             <Route path="/smart-solutions-utility" element={<Smart_Utility />} />
                   
        <Route path="/green-solutions" element={<GreenSolutions />} />

         {/* <Route path="/test_th/th" element={<Test_TH />} />
        <Route path="/test_en/en" element={<Test_EN />} />  */}


             
      </Routes>
      </Suspense>
    </Router>
 
  );
}

export default App;