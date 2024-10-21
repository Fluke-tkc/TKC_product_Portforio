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
      {/* <img src="/image/cybersecurity.jpg" alt="Cloud Integration" /> */}
    </div>
  </div>
</div>

    
<div className={styles.productShowcase}>
  <div className={styles.showcaseContent}>
    <div className={styles.imageContainer2}>
      <img src="/image/cybersecurity.jpg" alt="Automotive Dashboard" />
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

<div className={styles.threeColumnSolutions}>
  <div className={styles.solutionCard}>
    <img src="/image/solution1.jpg" alt="Solution 1" className={styles.solutionImage} />
    <h3>AI-Driven Analytics</h3>
    <p>Unleash the power of artificial intelligence to make sense of your data and drive decision-making.</p>
  </div>
  <div className={styles.solutionCard}>
    <img src="/image/solution2.jpg" alt="Solution 2" className={styles.solutionImage} />
    <h3>Cybersecurity Solutions</h3>
    <p>Protect your infrastructure with the latest in cybersecurity technology, ensuring your data stays safe.</p>
  </div>
  <div className={styles.solutionCard}>
    <img src="/image/solution3.jpg" alt="Solution 3" className={styles.solutionImage} />
    <h3>Cloud Transformation</h3>
    <p>Transform your business with cloud solutions tailored to your unique needs.</p>
  </div>
</div>

<div className={styles.gridSolutions}>
  <div className={styles.gridItem}>
    <h3>Cloud Computing</h3>
    <p>Explore a variety of cloud computing solutions tailored to your business needs.</p>
  </div>
  <div className={styles.gridItem}>
    <h3>AI Automation</h3>
    <p>Leverage AI-driven automation to optimize your workflows and increase productivity.</p>
  </div>
  <div className={styles.gridItem}>
    <h3>Data Analytics</h3>
    <p>Make better decisions by harnessing the power of data analytics and machine learning.</p>
  </div>
  <div className={styles.gridItem}>
    <h3>Internet of Things (IoT)</h3>
    <p>Connect and manage your devices with our scalable IoT solutions.</p>
  </div>
</div>






      <Contact />
      <div></div>
    </>
  );
};

export default SmartSolutions;
