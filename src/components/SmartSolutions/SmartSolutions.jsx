import React from "react";
import styles from "./SmartSolutions.module.css";
import { Navbar } from "../Navbar/Navbar";
import { Contact } from "../Contact/Contact";

export const SmartSolutions = () => {
  return (
    <>
      <Navbar />
      <div className={styles.solutionSection}>
  <div className={styles.solutionContent}>
    <div className={styles.textContainer1}>
      <h2>Cloud Integration Solutions</h2>
      <p>
        Our cloud integration solutions help you seamlessly connect your on-premise infrastructure with cloud services.
        Enjoy the flexibility of both worlds while ensuring data security and performance.
      </p>
      <div className={styles.buttons}>
        <a href="#learn-more" className={styles.primaryButton}>Learn more</a>
      </div>
    </div>
    <div className={styles.imageContainer1}>
     
    </div>
  </div>
</div>

    
<div className={styles.productShowcase_right}>
  <div className={styles.showcaseContent_right}>
    <div className={styles.imageContainer2}>
      {/* <img src="/image/cybersecurity.jpg" alt="Automotive Dashboard" /> */}
    </div>
    <div className={styles.textContainer}>
      <h2>Automotive Cloud</h2>
      <p>
        See your driver’s information in one place. Dive into purchase and service histories,
        check open leases and warranties, and even manage in-vehicle features and subscriptions.
        Now you can surprise and delight at every touchpoint with an AI CRM for automotive.
      </p>
      <div className={styles.buttons}>
        <a href="#learn-more" className={styles.primaryButton}>Learn more</a>
        <a href="#try-for-free" className={styles.secondaryButton}>Try for free</a>
      </div>
    </div>
  </div>
</div>


<div className={styles.productShowcase_left}>
  <div className={styles.showcaseContent_left}>
    <div className={styles.imageContainer2}>
      {/* <img src="/image/cybersecurity.jpg" alt="Automotive Dashboard" /> */}
    </div>
    <div className={styles.textContainer}>
      <h2>Automotive Cloud</h2>
      <p>
        See your driver’s information in one place. Dive into purchase and service histories,
        check open leases and warranties, and even manage in-vehicle features and subscriptions.
        Now you can surprise and delight at every touchpoint with an AI CRM for automotive.
      </p>
      <div className={styles.buttons}>
        <a href="#learn-more" className={styles.primaryButton}>Learn more</a>
        <a href="#try-for-free" className={styles.secondaryButton}>Try for free</a>
      </div>
    </div>
  </div>
</div>










      <Contact />
      <div></div>
    </>
  );
};

export default SmartSolutions;
