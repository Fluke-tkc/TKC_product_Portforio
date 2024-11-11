import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Features } from "../Allmodule/Features";
import { Team } from "../Allmodule/Team";
import { BlogPosts } from "../Allmodule/BlogPosts";
import { Navbar } from "../Navbar/Navbar";
import styles from "./Hero_New.module.css";


const SliderItem = ({ image, position, total, isRunning }) => (
  <div 
    className={`${styles.item} ${!isRunning ? styles.pausedAnimation : ''}`}
    style={{ 
      '--position': position,
      '--quantity': total
    }}
  >
    <img src={image} alt={`Slider item ${position}`} />
  </div>
);

const ServiceCard = ({ name, description, image, onClick }) => (
  <div className={styles.serviceCard} onClick={onClick}>
    <img src={image} alt={name} className={styles.serviceImage} />
    <h3>{name}</h3>
    <p>{description}</p>
  </div>
);

export const Hero_New = () => {
  const navigate = useNavigate();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const [isAnimationRunning, setIsAnimationRunning] = useState(true);


  const sliderImages = [
    '/image/smartsolution2.png',
    '/image/Smart Hospital.jpg',
    '/image/Samrt Platform.jpg',
    '/image/Smart Learning.jpg',
    '/image/Smart Logistics.jpg',
    '/image/SmartSolutions_Organized_Communication_Cables.jpg',
    '/image/Autonomous Solution.jpg',
    '/image/Cyber Security.jpg',
    '/image/Smart Farming.jpg',
    '/image/Smart Utility (Grid).jpg',
    '/image/Cloud Services.jpg',
  ];

  

  useEffect(() => {
    let interval;
    if (isAnimationRunning) {
      interval = setInterval(() => {
        setCurrentBannerIndex((prev) => 
          prev === sliderImages.length - 1 ? 0 : prev + 1
        );
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAnimationRunning]);

  const handleMouseEnter = () => {
    setIsAnimationRunning(false);
  };

  const handleMouseLeave = () => {
    setIsAnimationRunning(true);
  };

  return (
    <>
      <Navbar />
      <div className={styles.slider_section}>
        <div className={styles.banner}>
          <div 
            className={`${styles.slider} ${!isAnimationRunning ? styles.pausedAnimation : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {sliderImages.map((image, index) => (
              <SliderItem 
                key={index}
                image={image}
                position={index + 1}
                total={sliderImages.length}
                isRunning={isAnimationRunning}
              />
            ))}
          </div>

          <div className={styles.content}>
            <h1 data-content="SMART SOLUTIONS">SMART SOLUTIONS</h1>
            <div className={styles.author}>
              <h2></h2>
              <p>Transform your business with our innovative smart solutions</p>
            </div>
          </div>
        </div>
      </div>

        {/* Services Section */}
       
       
 

      <Features />
      <Team />
      <BlogPosts />
      <Contact />
    </>
  );
};

export default Hero_New;