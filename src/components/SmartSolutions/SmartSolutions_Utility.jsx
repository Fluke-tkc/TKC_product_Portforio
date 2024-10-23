import React from "react";
import styles from "./SmartSolutions_Utility.module.css";
import { Navbar } from "../Navbar/Navbar";
import { Contact } from "../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const SmartSolutions_Utility = () => { // แก้ไขชื่อ component ให้ตรงกัน

  const navigate = useNavigate();

  const handleLearnMoreClick_smart_Utility = () => {
    navigate("/smart-solutions-utility");
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
            <img
          src="/image/Smart_Utility_Grid.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         />
              <div className={styles.aboutItemText}>
                <h3>Smart Organized Communication Cables</h3>
                <p>
                ระบบโครงข่ายไฟฟ้าอัจฉริยะที่ผสมผสานเทคโนโลยีดิจิทัลเพื่อการผลิต การส่งจ่าย 
                และการบริหารจัดการพลังงานอย่างมีประสิทธิภาพ มีองค์ประกอบหลักดังนี้:
                  <div className={styles.buttonContainer}>
                  <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Utility} >เพื่มเติม</a>
                  </div>
                </p>

                
              </div>
              {/* <img
          src="/image/Smart_Farm1.jpg" 
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
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

export default SmartSolutions_Utility;
