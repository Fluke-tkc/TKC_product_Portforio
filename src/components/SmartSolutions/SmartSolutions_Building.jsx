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


  const handleLearnMoreClick_smart_Building = () => {
    navigate("/smart-solutions-building");
  };

  const handleLearnMoreClick_smart_BuildingTo_RenewableEnergyIntegration= () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'renewableEnergy' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_Lighting= () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Lighting' } });
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
                <h3>Smart Building</h3>
                <div className={styles.aboutItemp}>
                Smart Building ช่วยให้การบริหารจัดการอาคารเป็นไปอย่างมีประสิทธิภาพ ทั้งในแง่การประหยัดพลังงาน การดูแลรักษาความปลอดภัย
                 และการสร้างสภาพแวดล้อมที่น่าอยู่สำหรับผู้ใช้อาคาร​
                เป็นอาคารที่ใช้เทคโนโลยีในการจัดการและควบคุมระบบต่าง ๆ ภายในอาคาร
                 เพื่อเพิ่มประสิทธิภาพในการใช้พลังงาน เพิ่มความสะดวกสบาย ความปลอดภัย และความยั่งยืน
                  องค์ประกอบสำคัญของ Smart Building ประกอบไปด้วย
                  <div className={styles.buttonContainer}>
                  <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Building} >เพื่มเติม</a>
                  </div>
                  </div>

                
                  </div>
                
                  <div className={styles.imageContainer}>
                        <img
                          src="/image/SmartBuilding.jpg"
                          alt="Smart Building"
                           className={styles.aboutImage}
                          />
                   <div className={styles.redDot_RenewableEnergyIntegration} onClick={handleLearnMoreClick_smart_BuildingTo_RenewableEnergyIntegration}
                     title="Solar cell"></div>
                   <div className={styles.redDot_Lighting} onClick={handleLearnMoreClick_smart_BuildingTo_Lighting}
                    title="Smart Lighting"></div>
                </div>
          </li>
        </ul>
      </div>
    </section>
    
    </>
  );
};

export default SmartSolutions_Building;
