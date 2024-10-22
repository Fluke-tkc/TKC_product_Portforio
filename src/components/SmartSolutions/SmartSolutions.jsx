import React from "react";
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

  // ฟังก์ชันที่จะนำทางไปยังหน้า SmartSolutions_Building
  const handleLearnMoreClick_smart_Building = () => {
    navigate("/smart-solutions-building"); // URL ที่ต้องการนำทาง
  };

  return (
    <>
      <Navbar />
      <section className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Smart Solutions</h1>
          <p className={styles.description}>
            Hello My name is Aphichat Rungruang or call me Fluke. I am a Unity
            Developer. I love games and am happy when everyone can play my
            games. I feel like I haven't developed myself enough.
          </p>
        </div>

        {/* แทรก component SmartSolutions_Building */}
        
      </section>
      
      <SmartSolutionsBuilding />
     <SmartSolutionsFram/>
      <SmartSolutionsHospital/>
     <SmartSolutionsLearning/>
     <SmartSolutionsLogistics/>
     <SmartSolutionsOrganizedCommunicationCables/>
     <SmartSolutionsPlatform/>
     <SmartSolutionsUtility/>
      <div className={styles.productShowcase_left}></div>

      <Contact />
    </>
  );
};

export default SmartSolutions;
