import React, { useEffect } from "react";
import styles from "./GreenSolutions.module.css";
import { Navbar } from "../Navbar/Navbar";
import { Contact } from "../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate
 import GreenSolutionscomponent from "./GreenSolutions_component"; 
 import GreenSolutionsRelated from "./GreenSolutions_Related"; 

export const GreenSolutions = () => {
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
      <section className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Green Solutions</h1>
          <p className={styles.description}>
          Green Solution หรือ "โซลูชันสีเขียว"  แนวทางหรือวิธีการที่ออกแบบมาเพื่อลดผลกระทบต่อสิ่งแวดล้อม 
          โดยมุ่งเน้นการใช้ทรัพยากรอย่างมีประสิทธิภาพและยั่งยืน รวมถึงการพัฒนาและใช้เทคโนโลยีที่เป็นมิตรต่อสิ่งแวดล้อม เป้าหมายหลักของ Green Solution
           คือการสร้างความสมดุลระหว่างการพัฒนาเศรษฐกิจและการอนุรักษ์สิ่งแวดล้อม​
          </p>
        </div>

        {/* แทรก component SmartSolutions_Building */}
        
      </section>
      
       <GreenSolutionscomponent />
       <GreenSolutionsRelated/>
     
     
      <Contact />
    </>
  );
};

export default GreenSolutions;
