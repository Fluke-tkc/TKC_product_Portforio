import React, { createContext, useContext, useState } from 'react';

// สร้าง Context สำหรับเก็บข้อมูลภาษา
export const LanguageContext = createContext();

// Object เก็บ path รูปภาพตามภาษา
export const imageMapping = {
  en: {
    // รูปภาษาอังกฤษ Hero
    smartsolution2: '/image/smartsolution2.jpg',
    smartHospital: '/image/Smart Hospital.jpg',
    smartPlatform: '/image/Samrt Platform.jpg',
    smartLearning: '/image/Smart Learning.jpg',
    smartLogistics: '/image/Smart Logistics.jpg',
    organizedCommunication: '/image/SmartSolutions_Organized_Communication_Cables.jpg',
    autonomous: '/image/Autonomous Solution.jpg',
    cyberSecurity: '/image/Cyber Security.jpg',
    smartFarming: '/image/Smart Farming.jpg',
    smartUtility: '/image/Smart Utility (Grid).jpg',
    cloudServices: '/image/Cloud Services.jpg',

    smart_solutions_building_new00:'/image/SmartBuilding.png',
    smart_solutions_building_new_ver2_0:'/image/SmatOverlay.png',
    renewableEnergy:'/image/P_1.png',
    iot:'/image/P_2.png',
    SmartLighting:'/image/P_3.png',
    MotionSensors:'/image/P_4.png',
    SecuritySystem:'/image/P_5.png',
    AccessControlSystems:'/image/P_6.png',
    BuildingAutomationSystem:'/image/P_7.png',
    SmartParkingManagement:'/image/P_8.png',

   //utility
   smart_solutions_utility_new_00:'/image/SmartBuilding.png',
   smart_solutions_utility_new_ver2_0:'/image/SmartBuilding.png',
   DemandResponse_DR_EnergyManagementSystem_EMS:'/image/P_1.png',
   Renewable_Energy:'/image/P_2.png',
   Advanced_Mtering_Infrastructure_AMI:'/image/P_3.png',
   Microgrid_Prosumer:'/image/P_4.png',
   EV_Integration:'/image/P_5.png',
   EnergyStorageSysem:'/image/P_6.png',

    //Hospital
    smart_solutions_Hospital_new_00:'/image/SmartBuilding.png',
    smart_solutions_Hospital_new_ver2_0:'/image/SmartBuilding.png',
    Data_Analytics_Knowledge_Management:'/image/P_1.png',
    Smart_Diagnostics_Treatment:'/image/P_2.png',
    Smart_Safety_Convenience_Systems:'/image/P_3.png',
    Integrated_Patient_Care:'/image/P_4.png',
    Smart_Hospital_Management_Systems:'/image/P_5.png',
   


  },
  th: {
    // รูปภาษาไทย Hero
    smartsolution2: '/image/smartsolution2.jpg',
    smartHospital: '/image/Smart Hospital.jpg',
    smartPlatform: '/image/Samrt Platform.jpg',
    smartLearning: '/image/Smart Learning.jpg',
    smartLogistics: '/image/Smart Logistics.jpg',
    organizedCommunication: '/image/SmartSolutions_Organized_Communication_Cables.jpg',
    autonomous: '/image/Autonomous Solution.jpg',
    cyberSecurity: '/image/Cyber Security.jpg',
    smartFarming: '/image/Smart Farming.jpg',
    smartUtility: '/image/Smart Utility (Grid).jpg',
    cloudServices: '/image/Cloud Services.jpg',

    smart_solutions_building_new00:'/image/SmartBuilding_TH.png',
    smart_solutions_building_new_ver2_0:'/image/SmatOverlay_TH.png',
    renewableEnergy:'/image/BD_TH_1.png',
    iot:'/image/BD_TH_2.png',
    SmartLighting:'/image/BD_TH_3.png',
    MotionSensors:'/image/BD_TH_4.png',
    SecuritySystem:'/image/BD_TH_5.png',
    AccessControlSystems:'/image/BD_TH_6.png',
    BuildingAutomationSystem:'/image/BD_TH_7.png',
    SmartParkingManagement:'/image/BD_TH_8.png',
  }
};

// ข้อความตามภาษา
export const textContent = {
  en: {
    title: "SMART SOLUTIONS",
    subtitle: "Digital Communication Solutions",
    // เพิ่มข้อความอื่นๆ ตามต้องการ
    card1:"Smart Building",
    card2:"Smart Hospital",
    card3:"Smart Platform",
    card4:"Smart Learning",
    card5:"Smart Logistics",
    card6:"SmartOrganized Communication Cables",
    card7:"Autonomous",
    card8:"Cyber Security",
    card9:"Smart Farming",
    card10:"Smart Utility",
    card11:"Cloud Services",
    
  


  },
  th: {
    title: "โซลูชั่นอัจฉริยะ",
    subtitle: "โซลูชั่นการสื่อสารดิจิทัล",

    card1:"ตึกอัจฉริยะ",
    card2:"โรงพยาบาลอัจฉริยะ",
    card3:"แพลตฟอร์มอัจฉริยะ",
    card4:"การเรียนรู้อย่างชาญฉลาด",
    card5:"สมาร์ทโลจิสติกส์",
    card6:"สายเคเบิลสื่อสารอัจฉริยะ",
    card7:"อัตโนมัติ",
    card8:"ความปลอดภัยทางไซเบอร์",
    card9:"ฟาร์มอัจฉริยะ",
    card10:"ยูทิลิตี้อัจฉริยะ",
    card11:"บริการคลาวด์",
    // เพิ่มข้อความอื่นๆ ตามต้องการ



  }
};

// Provider Component
export const LanguageProvider = ({ children }) => {
  // State เก็บภาษาปัจจุบัน
  const [language, setLanguage] = useState('en');

  // ฟังก์ชันสลับภาษา
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'th' : 'en');
  };

  // สร้าง value object ที่จะส่งไปให้ component อื่นๆ
  const value = {
    language,
    toggleLanguage,
    text: textContent[language],
    images: imageMapping[language]
  };

  // Return Provider พร้อม value
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom Hook สำหรับเรียกใช้ Context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  // ตรวจสอบว่าใช้งานภายใต้ Provider หรือไม่
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};