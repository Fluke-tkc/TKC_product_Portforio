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
          <p>1234 Innovation Drive,<br /> Tech City, 56789</p>
        </div>
        <div className={styles.infoSection}>
          <h3>Email</h3>
          <ul className={styles.links}>
            <li className={styles.link}>
              <img src={getImageUrl("/image/emailIcon.png")} alt="Email icon" />
              <a href="mailto:Aphichatrungruang@gmail.com">Aphichatrungruang@gmail.com</a>
            </li>
            <li className={styles.link}>
              <img src={getImageUrl("/image/supportIcon.png")} alt="Support Email" />
              <a href="mailto:support@techcompany.com">support@techcompany.com</a>
            </li>
          </ul>
        </div>
        <div className={styles.infoSection}>
          <h3>Social Media</h3>
          <ul className={styles.links}>
            <li className={styles.link}>
              <img src={getImageUrl("/image/githubIcon.png")} alt="GitHub icon" />
              <a href="https://github.com/your-profile">github.com/your-profile</a>
            </li>
            <li className={styles.link}>
              <img src={getImageUrl("/image/linkedinIcon.png")} alt="LinkedIn icon" />
              <a href="https://linkedin.com/in/your-profile">linkedin.com/in/your-profile</a>
            </li>
            <li className={styles.link}>
              <img src={getImageUrl("/image/twitterIcon.png")} alt="Twitter icon" />
              <a href="https://twitter.com/your-profile">@your-profile</a>
            </li>
          </ul>
        </div>
        <div className={styles.infoSection}>
          <h3>Phone</h3>
          <p>+1 234 567 8900</p>
        </div>
      </div>
    </footer>
  );
};
