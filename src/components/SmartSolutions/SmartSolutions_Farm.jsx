import React, { useEffect } from "react";
import styles from "./SmartSolutions_Farm.module.css";
import { Navbar } from "../Navbar/Navbar";
import { Contact } from "../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const SmartSolutions_Farm = () => { // แก้ไขชื่อ component ให้ตรงกัน

  const navigate = useNavigate();


  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // เลื่อนไปยังตำแหน่งทันทีโดยไม่มีการหน่วง
    });
  }, []);

  const handleLearnMoreClick_smart_Farm = () => {
    navigate("/smart-solutions-fram");
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
          src="/image/Smart_Farm1.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         />
              <div className={styles.aboutItemText}>
                <h3>Smart Farm</h3>
                <div className={styles.aboutItemp}>
                ฟาร์มอัจฉริยะใช้เทคโนโลยี IoT (Internet of Things) และ Sensors ในการจัดการและปรับปรุงการทำงานในฟาร์มอย่างมีประสิทธิภาพมากขึ้น
                 โดยมุ่งเน้นการประหยัดทรัพยากร ลดการใช้แรงงานและเพิ่มผลผลิตด้วยข้อมูลที่ได้รับจากเซ็นเซอร์และอุปกรณ์อัจฉริยะ 
                 หลักการและการใช้งานของอุปกรณ์ IoT และเซ็นเซอร์ใน Smart Farm มีดังนี้
                  <div className={styles.buttonContainer}>
                  <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Farm} >เพื่มเติม</a>
                  </div>
                  </div>

                
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

export default SmartSolutions_Farm;
