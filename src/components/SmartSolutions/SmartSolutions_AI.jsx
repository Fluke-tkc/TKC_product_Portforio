import React from "react";
import styles from "./SmartSolutions_AI.module.css";

export const SmartSolutions_AI = () => {

  return (
   
      <div className={styles.backgroundDiv_AI}>
       <section className={styles.container_A} id="about">
   
      <div className={styles.content}>
      <img src="/image/AI.jpg" alt="AI Image" className={styles.aboutImage} />

         
         
        
        <ul className={styles.aboutItems}>
          <li className={styles.aboutItem}>
           
            <div className={styles.aboutItemText}>
              <h3>AI</h3>
              <p>
                I'm a Unity programmer, I work on all kinds of gameplay development.
                 projects and learning Includes how-to code and optimization tips. 
                  I learned a lot of ways to make games VR AR . I learn to work as a team and division 
                  of duties. I have studied worked FrontEnd and BackEnd
              </p>
            </div>
          </li>
       
         
        </ul>
      </div>
    </section>
       </div>
  
  );
};

export default SmartSolutions_AI;
