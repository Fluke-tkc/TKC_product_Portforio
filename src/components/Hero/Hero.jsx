import React from "react";
import { useNavigate } from "react-router-dom"; // ใช้ useNavigate
import styles from "./Hero.module.css";

export const Hero = () => {
  const navigate = useNavigate(); // ใช้ navigate

  const topics = [
    { name: "Smart Solutions", imgSrc: "/assets/image/AI.jpg" },
    { name: "Cloud Solution", imgSrc: "/assets/image/cloud-solution.png" },
    { name: "Cyber Security", imgSrc: "/assets/image/cyber-security.png" },
    { name: "Software Development", imgSrc: "/assets/image/software-development.png" },
    { name: "Green Solution", imgSrc: "/assets/image/green-solution.png" },
    { name: "Telecom and Network Infrastructure", imgSrc: "/assets/image/telecom.png" },
    { name: "ICT Infrastructure", imgSrc: "/assets/image/ict.png" },
    { name: "Public Safety", imgSrc: "/assets/image/public-safety.png" },
    { name: "Logistics", imgSrc: "/assets/image/logistics.png" },
    { name: "Edutech", imgSrc: "/assets/image/edutech.png" },
    { name: "Autonomous System", imgSrc: "/assets/image/autonomous-system.png" }
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
