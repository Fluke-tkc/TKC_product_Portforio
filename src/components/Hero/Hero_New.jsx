import React, { useState, useEffect, useRef } from "react";
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

export const Hero_New = () => {
  const navigate = useNavigate();
  const [isAnimationRunning, setIsAnimationRunning] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const sliderRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const frameRef = useRef(null);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    currentRotation: 0,
    lastRotation: 0,
    velocity: 0,
    timestamp: 0
  });

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
    // Initialize slider rotation on mount
    if (sliderRef.current) {
      const isMobile = window.innerWidth <= 767;
      sliderRef.current.style.transform = isMobile 
        ? 'translateX(-50%) perspective(1000px) rotateX(-16deg) rotateY(0deg)'
        : 'translateX(-50%) perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  }, []);
// เพิ่ม event listener สำหรับการ resize
useEffect(() => {
  const handleResize = () => {
    if (sliderRef.current) {
      const isMobile = window.innerWidth <= 767;
      const currentRotation = getCurrentRotation();
      applyRotation(currentRotation);
    }
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const clearResumeTimer = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const getCurrentRotation = () => {
    if (!sliderRef.current) return 0;
    const transform = sliderRef.current.style.transform;
    const match = transform.match(/rotateY\(([-\d.]+)deg\)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const applyRotation = (rotation) => {
    if (!sliderRef.current) return;
    sliderRef.current.style.transform = `
      translateX(-50%) 
      perspective(1000px) 
      rotateX(0deg) 
      rotateY(${rotation}deg)
    `;

    const isMobile = window.innerWidth <= 767;
  
    if (isMobile) {
      sliderRef.current.style.transform = `
        translateX(-50%) 
        perspective(1000px) 
        rotateX(-16deg) 
        rotateY(${rotation}deg)
      `;
      // เก็บค่า rotation ปัจจุบันไว้ใน CSS variable
      sliderRef.current.style.setProperty('--current-rotation', `${rotation}deg`);
    } else {
      sliderRef.current.style.transform = `
        translateX(-50%) 
        perspective(1000px) 
        rotateX(0deg) 
        rotateY(${rotation}deg)
      `;
    }
  };
 

  const handleStart = (clientX) => {
    clearResumeTimer();
    setIsAnimationRunning(false);
    setIsDragging(true);

    dragRef.current = {
      startX: clientX,
      lastX: clientX,
      currentRotation: getCurrentRotation(),
      lastRotation: getCurrentRotation(),
      velocity: 0,
      timestamp: Date.now()
    };
  };
  

  const handleMove = (clientX) => {
    if (!isDragging || !sliderRef.current) return;

    const deltaX = clientX - dragRef.current.lastX;
    const now = Date.now();
    const deltaTime = Math.max(1, now - dragRef.current.timestamp);
    
    dragRef.current.velocity = deltaX / deltaTime;
    // ลดความเร็วในการปัดโดยลดค่า sensitivity
    const sensitivity = 0.2;
    const newRotation = dragRef.current.currentRotation + (deltaX * sensitivity);
    
    applyRotation(newRotation);
    
    dragRef.current = {
      ...dragRef.current,
      lastX: clientX,
      currentRotation: newRotation,
      timestamp: now
    };
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);

    const velocity = dragRef.current.velocity;
    if (Math.abs(velocity) > 0.1) {
       // ลดความเร็ว momentum
      let momentum = velocity * 2;
      let currentRotation = dragRef.current.currentRotation;
      
      const animate = () => {
        // เพิ่มความหน่วงในการหยุด
        if (Math.abs(momentum) < 0.01) {
          cancelAnimationFrame(frameRef.current);
          startResumeTimer();
          return;
        }

        currentRotation += momentum;
        applyRotation(currentRotation);
        // เพิ่มความหน่วงให้มากขึ้น
        momentum *= 0.95;
        frameRef.current = requestAnimationFrame(animate);
      };
      
      frameRef.current = requestAnimationFrame(animate);
    } else {
      startResumeTimer();
    }
  };

  const startResumeTimer = () => {
    clearResumeTimer();
    if (!sliderRef.current?.matches(':hover')) {
      resumeTimerRef.current = setTimeout(() => {
        setIsAnimationRunning(true);
      }, 10000);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  return (
    <>
      <Navbar />
      <div className={styles.slider_section}>
        <div className={styles.banner}>
          <div 
            ref={sliderRef}
            className={`${styles.slider} ${!isAnimationRunning ? styles.pausedAnimation : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={isDragging ? handleMouseMove : undefined}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
              <p>Transform your business with our innovative smart solutions</p>
            </div>
          </div>
        </div>
      </div>

      <Features />
      <Team />
      <BlogPosts />
      <Contact />
    </>
  );
};

export default Hero_New;