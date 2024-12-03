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
    cloudServices: '/image/Cloud Services.jpg'
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
    cloudServices: '/image/Cloud Services.jpg'
  }
};

// ข้อความตามภาษา
export const textContent = {
  en: {
    title: "SMART SOLUTIONS",
    subtitle: "Transform your business with our innovative smart solutions",
    // เพิ่มข้อความอื่นๆ ตามต้องการ
  },
  th: {
    title: "โซลูชั่นอัจฉริยะ",
    subtitle: "ยกระดับธุรกิจของคุณด้วยโซลูชั่นนวัตกรรมอัจฉริยะของเรา",
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