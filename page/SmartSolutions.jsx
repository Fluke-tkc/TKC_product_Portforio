import React from "react";
import styles from "./SmartSolutions.module.css";

export const SmartSolutions = () => {
  const buttons = [
    { text: "AI", imgSrc: "/assets/image/AI.jpg" },
    { text: "Big Data", imgSrc: "/assets/image/bigdata.jpg" },
    { text: "Computer Vision", imgSrc: "/assets/image/computervision.jpg" },
    { text: "AR/VR/XR", imgSrc: "/assets/image/AR VR XR MR.jpg" },
    { text: "IOT", imgSrc: "/assets/image/IOT.jpg" },
    { text: "Machine-to-Machine Communication", imgSrc: "/assets/image/Machine-to-Machine.jpg" },
    { text: "mmWave", imgSrc: "/assets/image/MMwave.jpg" },

  ];

  return (
    <section className={styles.container}>
      <div className={styles.header}>Smart Solutions</div>
      <div className={styles.gridContainer}>
        {buttons.map((button, index) => (
          <button key={index}>
            <img src={button.imgSrc} alt={button.text} />
            <span>{button.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default SmartSolutions;
