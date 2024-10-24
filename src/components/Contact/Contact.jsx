import React from "react";
import styles from "./Contact.module.css";
import { getImageUrl } from "../../utils"; // ถ้ามี utility ที่เกี่ยวข้อง

export const Contact = () => {
  return (
    <footer id="contact" className={styles.container}>
      <div className={styles.contactDetails}>
        <h2>Contact Us</h2>
        {/* <p>We'd love to hear from you! Reach out to us through any of the following channels:</p> */}
      </div>
      <div className={styles.contactInfo}>
        <div className={styles.infoSection}>
          <h3>Address</h3>
          <p>44/44 ซอยวิภาวดีรังสิต 60 แยก 18-1-2 <br />แขวงตลาดบางเขน เขตหลักสี่, Bangkok, Bangkok,</p>
        </div>
        <div className={styles.infoSection}>
          <h3>Email</h3>
          <ul className={styles.links}>
            <li className={styles.link}>
              {/* <img src={getImageUrl("/image/emailIcon.png")} alt="Email icon" /> */}
              <a href="mailto:Aphichatrungruang@gmail.com">info@tkc-services.com</a>
            </li>
           
          </ul>
        </div>
        <div className={styles.infoSection}>
          <h3>Social Media</h3>
          <ul className={styles.links}>
            <li className={styles.link}>
              {/* <img src={getImageUrl("/image/githubIcon.png")} alt="GitHub icon" /> */}
              <a href="https://www.tkc-services.com/th/home">tkc-services.com</a>
            </li>
            
          </ul>
        </div>
        <div className={styles.infoSection}>
          <h3>Phone</h3>
          <p>(+66) 0-2401-8222</p>
        </div>
      </div>
    </footer>
  );
};
