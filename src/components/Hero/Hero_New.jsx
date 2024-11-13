import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Features } from "../Allmodule/Features";
import { Team } from "../Allmodule/Team";
import { BlogPosts } from "../Allmodule/BlogPosts";
import { Navbar } from "../Navbar/Navbar";
import styles from "./Hero_New.module.css";

// Constants for drag settings
const DRAG_SETTINGS = {
  sensitivity: 0.1,          // ความไวในการลาก
  momentumMultiplier: 1,    // ความแรงของ momentum
  momentumDampening: 0.97,   // การชะลอตัว
  minimumVelocity: 0.05,     // ความเร็วขั้นต่ำที่จะเริ่ม momentum
  rotationSpeed: 2,         // ความเร็วในการหมุนอัตโนมัติ
};

// SliderItem Component
const SliderItem = ({ image, position, total, onClick, title, onMouseEnter, onMouseLeave, onMouseDown }) => (
  <div 
    className={styles.item}
    style={{ 
      '--position': position,
      '--quantity': total
    }}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onMouseDown={onMouseDown}
    role="button"
    tabIndex={0}
    aria-label={`Navigate to ${title}`}
  >
    <img 
      src={image} 
      alt={title}
      draggable={false}
      className={styles.itemImage}
    />
    <div className={styles.itemOverlay}>
      <span className={styles.itemTitle}>{title}</span>
    </div>
  </div>
);

export const Hero_New = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  
  const sliderRef = useRef(null);
  const animationFrameRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const dragRef = useRef({
    startX: 0,
    lastX: 0,
    currentRotation: 0,
    velocity: 0,
    timestamp: 0
  });

  // Image routes data
  const imageRoutes = [
    { 
      image: '/image/smartsolution2.png',
      route: '/smart-solutions-building_new',
      title: 'Smart Building'
    },
    { 
      image: '/image/Smart Hospital.jpg',
      route: '/smart-hospital',
      title: 'Smart Hospital'
    },
    { 
      image: '/image/Samrt Platform.jpg',
      route: '/smart-platform',
      title: 'Smart Platform'
    },
    { 
      image: '/image/Smart Learning.jpg',
      route: '/smart-learning',
      title: 'Smart Learning'
    },
    { 
      image: '/image/Smart Logistics.jpg',
      route: '/smart-logistics',
      title: 'Smart Logistics'
    },
    { 
      image: '/image/SmartSolutions_Organized_Communication_Cables.jpg',
      route: '/communication-solutions',
      title: 'SmartOrganized Communication Cables'
    },
    { 
      image: '/image/Autonomous Solution.jpg',
      route: '/autonomous-solutions',
      title: 'Autonomous'
    },
    { 
      image: '/image/Cyber Security.jpg',
      route: '/cyber-security',
      title: 'Cyber Security'
    },
    { 
      image: '/image/Smart Farming.jpg',
      route: '/smart-farming',
      title: 'Smart Farming'
    },
    { 
      image: '/image/Smart Utility (Grid).jpg',
      route: '/smart-solutions-utility_new',
      title: 'Smart Utility'
    },
    { 
      image: '/image/Cloud Services.jpg',
      route: '/cloud-services',
      title: 'Cloud Services'
    }
  ];

  // Automatic rotation effect
  useEffect(() => {
    let lastTimestamp = 0;

    const animateRotation = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isRotating && !isDragging) {
        setCurrentRotation(prev => {
          const newRotation = prev + DRAG_SETTINGS.rotationSpeed * deltaTime;
          return newRotation % 360;
        });
      }

      animationFrameRef.current = requestAnimationFrame(animateRotation);
    };

    if (isRotating && !isDragging) {
      animationFrameRef.current = requestAnimationFrame(animateRotation);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRotating, isDragging]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      clearResumeTimer();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    };
  }, []);

  // Utility functions
  const clearResumeTimer = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  // Event handlers
  const handleImageMouseEnter = (index) => {
    setIsRotating(false);
    setActiveImageIndex(index);
    clearResumeTimer();
  };

  const handleImageMouseLeave = (index) => {
    setActiveImageIndex(null); // ลบเช็คเงื่อนไข activeImageIndex
    
    if (!isDragging) {  // เช็คแค่ว่าไม่ได้กำลังลากอยู่
        clearResumeTimer(); // เคลียร์ timer เก่าก่อน
        resumeTimerRef.current = setTimeout(() => {
            setIsRotating(true);
        }, 5000);
    }
};

  const handleImageMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const deltaX = touch.clientX - dragRef.current.lastX;
    
    setCurrentRotation(prev => {
      const newRotation = prev + deltaX * DRAG_SETTINGS.sensitivity;
      return newRotation % 360;
    });

    const now = Date.now();
    dragRef.current = {
      ...dragRef.current,
      lastX: touch.clientX,
      velocity: deltaX / (now - dragRef.current.timestamp),
      timestamp: now
    };
  };

  const handleMouseUpGlobal = () => {
    if (!isDragging) return;
    
    setIsDragging(false);

    document.removeEventListener('mousemove', handleImageMouseMove);
    document.removeEventListener('mouseup', handleMouseUpGlobal);
    document.removeEventListener('touchmove', handleImageMouseMove);
    document.removeEventListener('touchend', handleMouseUpGlobal);
    
    const velocity = dragRef.current.velocity;
    if (Math.abs(velocity) > DRAG_SETTINGS.minimumVelocity) {
        let momentum = velocity * DRAG_SETTINGS.momentumMultiplier;
        let currentVelocity = momentum;

        const applyMomentum = () => {
            if (Math.abs(currentVelocity) < DRAG_SETTINGS.minimumVelocity) {
                cancelAnimationFrame(animationFrameRef.current);
                // เริ่มนับเวลาใหม่หลังจาก momentum หยุด
                clearResumeTimer();
                resumeTimerRef.current = setTimeout(() => {
                    setIsRotating(true);
                }, 5000);
                return;
            }

            setCurrentRotation(prev => {
                const newRotation = prev + currentVelocity;
                return newRotation % 360;
            });

            currentVelocity *= DRAG_SETTINGS.momentumDampening;
            animationFrameRef.current = requestAnimationFrame(applyMomentum);
        };

        animationFrameRef.current = requestAnimationFrame(applyMomentum);
    } else {
        // เริ่มนับเวลาใหม่ทันทีถ้าไม่มี momentum
        clearResumeTimer();
        resumeTimerRef.current = setTimeout(() => {
            setIsRotating(true);
        }, 5000);
    }
};

  const handleImageMouseDown = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsRotating(false);
    setIsDragging(true);
    setActiveImageIndex(index);
    clearResumeTimer();

    const touch = e.touches ? e.touches[0] : e;
    dragRef.current = {
      startX: touch.clientX,
      lastX: touch.clientX,
      currentRotation: currentRotation,
      velocity: 0,
      timestamp: Date.now()
    };

    document.addEventListener('mousemove', handleImageMouseMove);
    document.addEventListener('mouseup', handleMouseUpGlobal);
    document.addEventListener('touchmove', handleImageMouseMove, { passive: false });
    document.addEventListener('touchend', handleMouseUpGlobal);
  };

  const handleImageClick = (route, event, index) => {
    if (!isDragging) {
      event.stopPropagation();
      navigate(route);
    }
  };

  return (
    <>
      <div className={styles.slider_section}>
        <div className={styles.banner}>
          <div 
            ref={sliderRef}
            className={styles.slider}
            style={{
              transform: `translateX(-50%) perspective(1000px) rotateX(${window.innerWidth <= 767 ? '-16deg' : '0deg'}) rotateY(${currentRotation}deg)`
            }}
          >
            {imageRoutes.map((item, index) => (
              <SliderItem 
                key={index}
                image={item.image}
                position={index + 1}
                total={imageRoutes.length}
                onClick={(e) => handleImageClick(item.route, e, index)}
                onMouseEnter={() => handleImageMouseEnter(index)}
                onMouseLeave={() => handleImageMouseLeave(index)}
                onMouseDown={(e) => handleImageMouseDown(e, index)}
                title={item.title}
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
      <Contact />
    </>
  );
};

export default Hero_New;