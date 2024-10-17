import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Hero.module.css";

export const Hero = () => {
  const navigate = useNavigate();

  const topics = [
    { name: "Smart Solutions", imgSrc: "/image/smartsolution.jpg" },
    { name: "Cloud Solution", imgSrc: "/image/cloudsolution.jpg" },
    { name: "Cyber Security", imgSrc: "/image/cybersecurity.jpg" },
    { name: "Software Development", imgSrc: "/image/softwaredevelopment.jpg" },
    { name: "Green Solution", imgSrc: "/image/greensolution.jpg" },
    { name: "Telecom and Network Infrastructure", imgSrc: "/image/Telecom-and-Network-Infrastructure.jpg" },
    { name: "ICT Infrastructure", imgSrc: "/image/ICTInfrastructure.jpg" },
    { name: "Public Safety", imgSrc: "/image/public-safety.jpg" },
    { name: "Logistics", imgSrc: "/image/Logistics.jpg" },
    { name: "Edutech", imgSrc: "/image/Edutech.jpg" },
    { name: "Autonomous System", imgSrc: "/image/Autonomous-System.jpg" }
  ];

  const handleButtonClick = (topic) => {
    if (topic.name === "Smart Solutions") {
      navigate("/smart-solutions");
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