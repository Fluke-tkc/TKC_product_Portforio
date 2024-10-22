import React from "react";
import styles from "./Smart_Building.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate

export const Smart_Building = () => {
//   const navigate = useNavigate();

  // ฟังก์ชันที่จะนำทางไปยังหน้า SmartSolutions_Building
//   const handleLearnMoreClick_smart_Building = () => {
//     navigate("/smart-solutions-building"); // URL ที่ต้องการนำทาง
//   };

  return (
    <>
      <Navbar />
      <section className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Smart Building</h1>
          <p className={styles.description}>
          Smart Building เป็นอาคารที่ใช้เทคโนโลยีในการจัดการและควบคุมระบบต่าง ๆ ภายในอาคาร 
          เพื่อเพิ่มประสิทธิภาพในการใช้พลังงาน เพิ่มความสะดวกสบาย ความปลอดภัย และความยั่งยืน 
          องค์ประกอบสำคัญของ Smart Building ประกอบไปด้วย:

          
          </p>
          {/* <h1 className={styles.description_A}>Smart Building</h1> */}
        </div>
        

        {/* แทรก component SmartSolutions_Building */}
        
      </section>
      
    
      <div className={styles.productShowcase_left}></div>

      <Contact />
    </>
  );
};

export default Smart_Building;
