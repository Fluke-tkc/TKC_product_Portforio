import React, { useEffect } from "react";
import styles from "./SmartSolutions_Building.module.css";
import { Navbar } from "../Navbar/Navbar";
import { Contact } from "../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const SmartSolutions_Building = () => { // แก้ไขชื่อ component ให้ตรงกัน

  const navigate = useNavigate();


  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // เลื่อนไปยังตำแหน่งทันทีโดยไม่มีการหน่วง
    });
  }, []);

  
  const handleLearnMoreClick_smart_building_New = () => {
    navigate("/smart-solutions-building_new");
  };

  return (
    <>
    
      <section className={styles.container} id="about">
        {/* <h2 className={styles.title}>Smart Building</h2> */}
        
        <div className={styles.content}>
        {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}

          <ul className={styles.aboutItems}>
            <li className={styles.aboutItem}>
              <div className={styles.aboutItemText}>
                <h3>Smart Hospital</h3>
                <div className={styles.aboutItemp}>
                เป็นแนวคิดที่นำเทคโนโลยีมาประยุกต์ใช้ในโรงพยาบาลเพื่อปรับปรุงการดูแลผู้ป่วย เพิ่มประสิทธิภาพในการทำงาน 
                และลดความผิดพลาดทางการแพทย์ โดยองค์ประกอบของ Smart Hospital ประกอบไปด้วย
                  <div className={styles.buttonContainer}>
                  <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_building_New} >เพื่มเติม</a>
                  </div>
                  </div>

                
              </div>
              <img
          src="/image/Smart_Building.jpg" 
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         />
            </li>
            
          </ul>
          {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
        </div>
      </section>
    
    </>
  );
};

export default SmartSolutions_Building;
