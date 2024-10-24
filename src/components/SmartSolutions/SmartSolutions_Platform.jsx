import React, { useEffect } from "react";
import styles from "./SmartSolutions_Platform.module.css";
import { Navbar } from "../Navbar/Navbar";
import { Contact } from "../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const SmartSolutions_Platform = () => { // แก้ไขชื่อ component ให้ตรงกัน

  const navigate = useNavigate();


  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // เลื่อนไปยังตำแหน่งทันทีโดยไม่มีการหน่วง
    });
  }, []);

  const handleLearnMoreClick_smart_Platform = () => {
    navigate("/smart-solutions-platform");
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
                <h3>Smart Platform</h3>
                <div className={styles.aboutItemp}>
                โครงสร้างหรือระบบที่ผสมผสานเทคโนโลยีและเครื่องมือทางดิจิทัลเพื่อสร้างแพลตฟอร์มอัจฉริยะที่สามารถเชื่อมโยงการทำงาน
                และข้อมูลเพื่อเพิ่มประสิทธิภาพและความสะดวกในการใช้งาน ปัจจัยหลักที่มักพบใน Smart Platform มีดังนี้
                  <div className={styles.buttonContainer}>
                  <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Platform} >เพื่มเติม</a>
                  </div>
                  </div>

                
              </div>
              <img
          src="/image/Smart_Platform.jpg" 
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

export default SmartSolutions_Platform;
