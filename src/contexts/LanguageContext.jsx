import React, { createContext, useContext, useState } from 'react';
import styles from './Prompt.module.css';
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
   
    //Organized_Communication_Cables
    smart_solutions_Organized_Communication_Cables_new_00:'/image/OC_0.png',
    smart_solutions_Organized_Communication_Cables_new_ver2_0:'/image/OC_00.png',
    Organize_Communication_Cable:'/image/OC_1.png',
    Underground_cables:'/image/OC_2.png',
    
    //Autonomous
    smart_solutions_Autonomous_new_00:'/image/AS_0.png',
    smart_solutions_Autonomous_new_ver2_0:'/image/AS_00.png',
    Autonomous_Security_Systems:'/image/AS_1.png',
    Autonomous_Vehicles:'/image/AS_2.png',
    Autonomous_Industrial_Robot:'/image/AS_3.png',
    Autonomous_Service_Robot:'/image/AS_4.png',

  //CyberSecurity
    smart_solutions_CyberSecurity_new_00:'/image/CBS_0.png',
    smart_solutions_CyberSecurity_new_ver2_0:'/image/CBS_00.png',
    Network_Security:'/image/CBS_1.png',
    Endpoint_Security:'/image/CBS_2.png',
    Application_Security_Cloud_Security:'/image/CBS_3.png',
    Cyber_Threat_Intelligence:'/image/CBS_4.png',
    Cyber_Security_Consulting_Services:'/image/CBS_5.png',


    //Logistics
    smart_solutions_Logistics_new_00:'/image/lg_0.png',
    smart_solutions_Logistics_new_ver2_0:'/image/lg_00.png',
    SmartScan:'/image/lg_1.png',
    RouteOptimization:'/image/lg_2.png',
    IntelligentCargoVolumeAnalysis:'/image/lg_3.png',
    TransferDelivery:'/image/lg_4.png',
    PointofSale:'/image/lg_5.png',


    //  //Learning
    //  smart_solutions_CyberSecurity_new_00:'/image/CBS_0.png',
    //  smart_solutions_CyberSecurity_new_ver2_0:'/image/CBS_00.png',
    //  Network_Security:'/image/CBS_1.png',
    //  Endpoint_Security:'/image/CBS_2.png',
    //  Application_Security_Cloud_Security:'/image/CBS_3.png',
    //  Cyber_Threat_Intelligence:'/image/CBS_4.png',
    //  Cyber_Security_Consulting_Services:'/image/CBS_5.png',
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
    smart_solutions_utility_new_00:'/image/U_1_TH.png',
    smart_solutions_utility_new_ver2_0:'/image/U_2_TH.png',
    DemandResponse_DR_EnergyManagementSystem_EMS:'/image/U_3_TH.png',
    Renewable_Energy:'/image/U_4_TH.png',
    Advanced_Mtering_Infrastructure_AMI:'/image/U_5_TH.png',
    Microgrid_Prosumer:'/image/U_6_TH.png',
    EV_Integration:'/image/U_7_TH.png',
    EnergyStorageSysem:'/image/U_8_TH.png',


      //Hospital
    smart_solutions_Hospital_new_00:'/image/SmartHospital_TH.png',
    smart_solutions_Hospital_new_ver2_0:'/image/SmartHospital_TH_2.png',
    Data_Analytics_Knowledge_Management:'/image/H_1_TH.png',
    Smart_Diagnostics_Treatment:'/image/H_2_TH.png',
    Smart_Safety_Convenience_Systems:'/image/H_3_TH.png',
    Integrated_Patient_Care:'/image/H_4_TH.png',
    Smart_Hospital_Management_Systems:'/image/H_5_TH.png',

    //cloud service
    smart_solutions_CloudServices_new_00:'/image/smart_cloudservice_TH.png',
    smart_solutions_CloudServices_new_ver2_0:'/image/smart_cloudservice_TH_2.png',
    Cloud_Data_Center_Solutions:'/image/CS_TH_1.png',
    Big_Data_Analytics_on_Cloud:'/image/CS_TH_2.png',
    AI_Services_on_Cloud:'/image/CS_TH_3.png',
    Security_and_Compliance_Services:'/image/CS_TH_4.png',
    ERP_on_Cloud:'/image/CS_TH_5.png',
    Cloud_Based_Call_Center_Chatbot:'/image/CS_TH_6.png',
    Blockchain:'/image/CS_TH_7.png',
    
    //Organized_Communication_Cables
    smart_solutions_Organized_Communication_Cables_new_00:'/image/OC_0_TH.png',
    smart_solutions_Organized_Communication_Cables_new_ver2_0:'/image/OC_00_TH.png',
    Organize_Communication_Cable:'/image/OC_1_TH.png',
    Underground_cables:'/image/OC_2_TH.png',

    //Autonomous
    smart_solutions_Autonomous_new_00:'/image/AS_0_TH.png',
    smart_solutions_Autonomous_new_ver2_0:'/image/AS_00_TH.png',
    Autonomous_Security_Systems:'/image/AS_1_TH.png',
    Autonomous_Vehicles:'/image/AS_2_TH.png',
    Autonomous_Industrial_Robot:'/image/AS_3_TH.png',
    Autonomous_Service_Robot:'/image/AS_4_TH.png',

  //CyberSecurity
  smart_solutions_CyberSecurity_new_00:'/image/CBS_0_TH.png',
  smart_solutions_CyberSecurity_new_ver2_0:'/image/CBS_00_TH.png',
  Network_Security:'/image/CBS_1_TH.png',
  Endpoint_Security:'/image/CBS_2_TH.png',
  Application_Security_Cloud_Security:'/image/CBS_3_TH.png',
  Cyber_Threat_Intelligence:'/image/CBS_4_TH.png',
  Cyber_Security_Consulting_Services:'/image/CBS_5_TH.png',


  smart_solutions_Logistics_new_00:'/image/lg_0_TH.png',
  smart_solutions_Logistics_new_ver2_0:'/image/lg_00_TH.png',
  SmartScan:'/image/lg_1_TH.png',
  RouteOptimization:'/image/lg_2_TH.png',
  IntelligentCargoVolumeAnalysis:'/image/lg_3_TH.png',
  TransferDelivery:'/image/lg_4_TH.png',
  PointofSale:'/image/lg_5_TH.png',

  }
};

// ข้อความตามภาษา
export const textContent = {
  en: {
    title: "SMART SOLUTIONS",//SMARTSOLUTIONS
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
    title: "ระบบอัจฉริยะ",
    subtitle: "Digital Communication Solutions",
    card1: <span className={styles.thaiFont}>ระบบอาคารอัจฉริยะ</span>,
    card2: <span className={styles.thaiFont}>ระบบโรงพยบาลอัจฉริยะ</span>,
    card3: <span className={styles.thaiFont}>ระบบแพลตฟอร์มอัจฉริยะ</span>,
    card4: <span className={styles.thaiFont}>ระบบการเรียนรู้อัจฉริยะ</span>,
    card5: <span className={styles.thaiFont}>ระบบขนส่งอัจฉริยะ</span>,
    card6: <span className={styles.thaiFont}>ระบบโครงข่ายสายสื่อสารอัจฉริยะ</span>,
    card7: <span className={styles.thaiFont}>ระบบการทำงานอัตโนมัติ</span>,
    card8: <span className={styles.thaiFont}>ระบบการรักษาความปลอดภัยทางไซเบอร์</span>,
    card9: <span className={styles.thaiFont}>ระบบเกษตรนวัตกรรมอัจฉริยะ</span>,
    card10: <span className={styles.thaiFont}>ระบบโครงสร้างพื้นฐานอัจฉริยะ</span>,
    card11: <span className={styles.thaiFont}>ระบบบริการ<br></br>คลาวด์อัจฉริยะ</span>,
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