import React from "react";
import { useNavigate } from "react-router-dom"; // ใช้ useNavigate
import styles from "./Hero.module.css";

export const Hero = () => {
  const navigate = useNavigate(); // ใช้ navigate

  const topics = [
    { name: "Smart Solutions", imgSrc: "/assets/nav/smartsolution.jpg" },
    { name: "Cloud Solution", imgSrc: "/assets/nav/cloudsolution.jpg" },
    { name: "Cyber Security", imgSrc: "/assets/nav/cybersecurity.jpg" },
    { name: "Software Development", imgSrc: "/assets/nav/softwaredevelopment.jpg" },
    { name: "Green Solution", imgSrc: "/assets/nav/greensolution.jpg" },
    { name: "Telecom and Network Infrastructure", imgSrc: "/assets/nav/Telecom and Network Infrastructure.jpg" },
    { name: "ICT Infrastructure", imgSrc: "/assets/nav/ICTInfrastructure.jpg" },
    { name: "Public Safety", imgSrc: "/assets/nav/public safety.jpg" },
    { name: "Logistics", imgSrc: "/assets/nav/Logistics.jpg" },
    { name: "Edutech", imgSrc: "/assets/nav/Edutech.jpg" },
    { name: "Autonomous System", imgSrc: "/assets/nav/Autonomous System.jpg" }
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
