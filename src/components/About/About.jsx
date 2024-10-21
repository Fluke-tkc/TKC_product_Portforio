import React from "react";

import styles from "./About.module.css";
import { getImageUrl } from "../../utils";

export const About = () => {
  return (
    <section className={styles.container} id="about">
      <h2 className={styles.title}>About Me</h2>
      <div className={styles.content}>
        <img
          src={getImageUrl("about/me.png")}
          alt="Me sitting with a laptop"
          className={styles.aboutImage}
        />
        <ul className={styles.aboutItems}>
          <li className={styles.aboutItem}>
           
            <div className={styles.aboutItemText}>
              <h3>Unity Programmer</h3>
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
  );
};
