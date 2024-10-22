import React from "react";
import styles from "./SmartSolutions_Building.module.css";
import { Navbar } from "../Navbar/Navbar";
import { Contact } from "../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const SmartSolutions_Building = () => { // แก้ไขชื่อ component ให้ตรงกัน


  const navigate = useNavigate();

  const handleLearnMoreClick_smart_Building = () => {
    navigate("/smart-solutions-building");
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
                <p>
                  I'm a Unity programmer, I work on all kinds of gameplay
                  development. Projects and learning includes how-to code and
                  optimization tips. I learned a lot of ways to make games VR
                  AR. I learn to work as a team and division of duties. I have
                  studied and worked in FrontEnd and BackEnd development.
                  <div className={styles.buttonContainer}>
                  <a href="#learn-more" className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Building} >เพื่มเติม</a>
                  </div>
                </p>

                
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
