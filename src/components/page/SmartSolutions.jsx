import React from "react";
import styles from "./SmartSolutions.module.css";

export const SmartSolutions = () => {
  const buttons1 = [
    { text: "AI", imgSrc: "/image/AI.jpg" },
    { text: "Big Data", imgSrc: "/image/bigdata.jpg" },
    { text: "Computer Vision", imgSrc: "/image/computervision.jpg" },
  ];
  const buttons2 = [
    { text: "AR/VR/XR", imgSrc: "/image/AR_VR_XR_MR.jpg" },
    { text: "IOT", imgSrc: "/image/IOT.jpg" },
    { text: "Machine-to-Machine Communication", imgSrc: "/image/Machine-to-Machine.jpg" },
  ];
  const buttons3 = [
    { text: "mmWave", imgSrc: "/image/MMwave.jpg" },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.header}>Smart Solutions</div>
      <div className={styles.gridContainer}>
        {buttons1.map((button, index) => (
          <button key={index}>
            <img src={button.imgSrc} alt={button.text} />
            <span>{button.text}</span>
          </button>
        ))}
      </div>
      <div className={styles.gridContainer}>
        {buttons2.map((button, index) => (
          <button key={index}>
            <img src={button.imgSrc} alt={button.text} />
            <span>{button.text}</span>
          </button>
        ))}
      </div>
      <div className={styles.gridContainer}>
        {buttons3.map((button, index) => (
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