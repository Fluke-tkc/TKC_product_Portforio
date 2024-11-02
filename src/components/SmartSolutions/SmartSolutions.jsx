import React, { useEffect } from "react";
import styles from "./SmartSolutions.module.css";
import { Navbar } from "../Navbar/Navbar";
import { Contact } from "../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate
import SmartSolutionsBuilding from "./SmartSolutions_Building"; 
import SmartSolutionsFram from "./SmartSolutions_Farm"; 
import SmartSolutionsHospital from "./SmartSolutions_Hospital"; 
import SmartSolutionsLearning from "./SmartSolutions_Learning"; 
import SmartSolutionsLogistics from "./SmartSolutions_Logistics"; 
import SmartSolutionsOrganizedCommunicationCables from "./SmartSolutions_Organized_Communication_Cables"; 
import SmartSolutionsPlatform from "./SmartSolutions_Platform"; 
import SmartSolutionsUtility from "./SmartSolutions_Utility"; 
export const SmartSolutions = () => {
  const navigate = useNavigate();


  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // เลื่อนไปยังตำแหน่งทันทีโดยไม่มีการหน่วง
    });
  }, []);
  // ฟังก์ชันที่จะนำทางไปยังหน้า SmartSolutions_Building
  const handleLearnMoreClick_smart_Building = () => {
    navigate("/smart-solutions-building"); // URL ที่ต้องการนำทาง
  };

  return (
    <>
      <Navbar />
      {/* <section className={styles.container}> */}
        {/* <div className={styles.content}>
          <h1 className={styles.title}>Smart Solutions</h1>
          <p className={styles.description}>
          แนวทางหรือระบบที่ใช้เทคโนโลยีขั้นสูงและนวัตกรรมในการแก้ปัญหาหรือปรับปรุงกระบวนการต่างๆ เพื่อเพิ่มประสิทธิภาพความสะดวกสบาย
           และประสบการณ์การใช้งาน โดยมุ่งเน้นการเชื่อมโยงข้อมูลและการทำงานร่วมกันระหว่างอุปกรณ์หรือระบบที่แตกต่างกัน
          </p>
        </div> */}

        {/* แทรก component SmartSolutions_Building */}
        
      {/* </section> */}
      
      <SmartSolutionsBuilding />
     {/* <SmartSolutionsFram/>
      <SmartSolutionsHospital/>
     <SmartSolutionsLearning/>
     <SmartSolutionsLogistics/>
     <SmartSolutionsOrganizedCommunicationCables/>
     <SmartSolutionsPlatform/>
     <SmartSolutionsUtility/> */}
      <div className={styles.productShowcase_left}></div>

      <Contact />
    </>
  );
};

export default SmartSolutions;
