import React, { useEffect } from "react";
import styles from "./SmartSolutions_Logistics.module.css";
import { Navbar } from "../Navbar/Navbar";
import { Contact } from "../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const SmartSolutions_Logistics = () => { // แก้ไขชื่อ component ให้ตรงกัน

  const navigate = useNavigate();


  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // เลื่อนไปยังตำแหน่งทันทีโดยไม่มีการหน่วง
    });
  }, []);

  const handleLearnMoreClick_smart_Logistics = () => {
    navigate("/smart-solutions-logistics");
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
                <h3>Smart Logistics</h3>
                <p>
                เป็นการผสานเทคโนโลยีสมัยใหม่เข้ากับระบบโลจิสติกส์เพื่อเพิ่มประสิทธิภาพ ลดต้นทุน 
                และสร้างความยืดหยุ่นในการจัดการสินค้าหรือข้อมูลในห่วงโซ่อุปทาน (supply chain) 
                หลักๆ แล้ว Smart Logistics ประกอบไปด้วยองค์ประกอบดังนี้:​
                  <div className={styles.buttonContainer}>
                  <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Logistics} >เพื่มเติม</a>
                  </div>
                </p>

                
              </div>
              <img
          src="/image/Smart_Logistics.jpg" 
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

export default SmartSolutions_Logistics;
