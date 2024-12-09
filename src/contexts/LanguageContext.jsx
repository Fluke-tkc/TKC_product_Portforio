import React, { createContext, useContext, useState } from 'react';

// สร้าง Context สำหรับเก็บข้อมูลภาษา
export const LanguageContext = createContext();

// Object เก็บ path รูปภาพตามภาษา
export const imageMapping = {
  en: {
    // รูปภาษาอังกฤษ Hero
  //main
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

    //Building
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
   smart_solutions_utility_new_00:'/image/U_1.png',
   smart_solutions_utility_new_ver2_0:'/image/U_2.png',
   DemandResponse_DR_EnergyManagementSystem_EMS:'/image/U_3.png',
   Renewable_Energy:'/image/U_4.png',
   Advanced_Mtering_Infrastructure_AMI:'/image/U_5.png',
   Microgrid_Prosumer:'/image/U_6.png',
   EV_Integration:'/image/U_7.png',
   EnergyStorageSysem:'/image/U_8.png',

    //Hospital
   smart_solutions_Hospital_new_00:'/image/SmartHospital.png',
   smart_solutions_Hospital_new_ver2_0:'/image/SmartHospital_2.png',
   Data_Analytics_Knowledge_Management:'/image/H_1.png',
   Smart_Diagnostics_Treatment:'/image/H_2.png',
   Smart_Safety_Convenience_Systems:'/image/H_3.png',
   Integrated_Patient_Care:'/image/H_4.png',
   Smart_Hospital_Management_Systems:'/image/H_5.png',


    //cloud service
    smart_solutions_CloudServices_new_00:'/image/smart_cloudservice.png',
    smart_solutions_CloudServices_new_ver2_0:'/image/smart_cloudservice_2.png',
    Cloud_Data_Center_Solutions:'/image/CS_1.png',
    Big_Data_Analytics_on_Cloud:'/image/CS_2.png',
    AI_Services_on_Cloud:'/image/CS_3.png',
    Security_and_Compliance_Services:'/image/CS_4.png',
    ERP_on_Cloud:'/image/CS_5.png',
    Cloud_Based_Call_Center_Chatbot:'/image/CS_6.png',
    Blockchain:'/image/CS_7.png',
   


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

     //Building
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

    //utility
    smart_solutions_utility_new_00:'/image/U_1.png',
    smart_solutions_utility_new_ver2_0:'/image/U_2.png',
    DemandResponse_DR_EnergyManagementSystem_EMS:'/image/U_3.png',
    Renewable_Energy:'/image/U_4.png',
    Advanced_Mtering_Infrastructure_AMI:'/image/U_5.png',
    Microgrid_Prosumer:'/image/U_6.png',
    EV_Integration:'/image/U_7.png',
    EnergyStorageSysem:'/image/U_8.png',


      //Hospital
    smart_solutions_Hospital_new_00:'/image/SmartHospital.png',
    smart_solutions_Hospital_new_ver2_0:'/image/SmartHospital_2.png',
    Data_Analytics_Knowledge_Management:'/image/H_1.png',
    Smart_Diagnostics_Treatment:'/image/H_2.png',
    Smart_Safety_Convenience_Systems:'/image/H_3.png',
    Integrated_Patient_Care:'/image/H_4.png',
    Smart_Hospital_Management_Systems:'/image/H_5.png',

    //cloud service
    smart_solutions_CloudServices_new_00:'/image/smart_cloudservice.png',
    smart_solutions_CloudServices_new_ver2_0:'/image/smart_cloudservice_2.png',
    Cloud_Data_Center_Solutions:'/image/CS_1.png',
    Big_Data_Analytics_on_Cloud:'/image/CS_2.png',
    AI_Services_on_Cloud:'/image/CS_3.png',
    Security_and_Compliance_Services:'/image/CS_4.png',
    ERP_on_Cloud:'/image/CS_5.png',
    Cloud_Based_Call_Center_Chatbot:'/image/CS_6.png',
    Blockchain:'/image/CS_7.png',
     
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