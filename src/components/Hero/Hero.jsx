import React from "react";
import { useNavigate } from "react-router-dom"; // ใช้ useNavigate
import styles from "./Hero.module.css";

export const Hero = () => {
  const navigate = useNavigate(); // ใช้ navigate

  const topics = [
    { name: "Smart Solutions", imgSrc: "/assets/image/smartsolution.jpg" },
    { name: "Cloud Solution", imgSrc: "/assets/image/cloudsolution.jpg" },
    { name: "Cyber Security", imgSrc: "/assets/image/cybersecurity.jpg" },
    { name: "Software Development", imgSrc: "/assets/image/softwaredevelopment.jpg" },
    { name: "Green Solution", imgSrc: "/assets/image/greensolution.jpg" },
    { name: "Telecom and Network Infrastructure", imgSrc: "/assets/image/Telecom and Network Infrastructure.jpg" },
    { name: "ICT Infrastructure", imgSrc: "/assets/image/ICTInfrastructure.jpg" },
    { name: "Public Safety", imgSrc: "/assets/image/public safety.jpg" },
    { name: "Logistics", imgSrc: "/assets/image/Logistics.jpg" },
    { name: "Edutech", imgSrc: "/assets/image/Edutech.jpg" },
    { name: "Autonomous System", imgSrc: "/assets/image/Autonomous System.jpg" }
  ];

  const handleButtonClick = (topic) => {
    if (topic.name === "Smart Solutions") {
      navigate("/smart-solutions"); // นำทางไปยังหน้า SmartSolutions.jsx
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.gridContainer}>
        {topics.map((topic, index) => (
          <div key={index} className={`${styles.circleWrapper} ${styles[`circle${index + 1}`]}`}>
            <button
              className={styles.circleButton}
              onClick={() => handleButtonClick(topic)}
            >
              <img src={topic.imgSrc} alt={topic.name} />
              <span>{topic.name}</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
