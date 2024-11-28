import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";
import styles from "./SmartSolutions_Building_New_ver02.module.css";

export const SmartSolutions_Building_New_ver02 = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showPostTutorialImage, setShowPostTutorialImage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isMouseEnterActive, setIsMouseEnterActive] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  const allImages = [
    {
      id: 'renewableEnergy',
      src: "/image/P_1.png",
      title: "Renewable Energy Integration",
      description: "Sustainable energy solutions for smart buildings"
    },
    {
      id: 'iot',
      src: "/image/P_2.png",
      title: "IoT Systems",
      description: "Connected devices and smart sensors"
    },
    {
      id: 'Access Control Systems',
      src: "/image/P_3.png",
      title: "Access Control",
      description: "Advanced security access management"
    },
    {
      id: 'Security System',
      src: "/image/P_4.png",
      title: "Security Systems",
      description: "Comprehensive building security"
    },
    {
      id: 'Smart Lighting',
      src: "/image/P_5.png",
      title: "Smart Lighting",
      description: "Intelligent lighting control"
    },
    {
      id: 'Building Automation System',
      src: "/image/P_6.png",
      title: "Building Automation",
      description: "Automated building management"
    },
    {
      id: 'Motion Sensors',
      src: "/image/P_7.png",
      title: "Motion Detection",
      description: "Advanced motion sensing technology"
    },
    {
      id: 'Smart Parking Management',
      src: "/image/P_8.png",
      title: "Smart Parking",
      description: "Intelligent parking solutions"
    }
  ];

  // Preload images
  const preloadImages = () => {
    allImages.forEach(imageData => {
      const img = new Image();
      img.src = imageData.src;
    });
  };

  useEffect(() => {
    preloadImages();
  }, []);

  const DynamicRedDots = ({ currentImage }) => {
    const [activeTooltip, setActiveTooltip] = useState(null);

    const dotConfigurations = {
      'renewableEnergy': [
        {
          className: styles.redDot_RenewableEnergyIntegrationWrapper,
          position: { top: '15%', left: '59%' }
        }
      ],
      'iot': [
        {
          className: styles.redDot_IotWrapper,
          position: { top: '35%', left: '18.5%' }
        }
      ],
      'Access Control Systems': [
        {
          id: 'access-control',
          className: styles.redDot_AccessControlSystemsWrapper,
          position: { top: '20%', left: '93.5%' }
        }
      ],
      'Security System': [
        {
          id: 'security-system',
          className: styles.redDot_SurveillanceSecurityWrapper,
          position: { top: '83%', left: '51.8%' }
        }
      ],
      'Smart Lighting': [
        {
          id: 'smart-lighting',
          className: styles.redDot_LightingWrapper,
          position: { top: '58%', left: '88%' }
        }
      ],
      'Building Automation System': [
        {
          id: 'building-automation',
          className: styles.redDot_BuildingAutomationWrapper,
          position: { top: '20%', left: '66%' }
        }
      ],
      'Motion Sensors': [
        {
          id: 'motion-sensors',
          className: styles.redDot_MotionSensorsWrapper,
          position: { top: '88%', left: '20%' }
        }
      ],
      'Smart Parking Management': [
        {
          id: 'smart-parking',
          className: styles.redDot_SmartParkingWrapper,
          position: { top: '82%', left: '85.8%' }
        }
      ]
    };

    const dots = dotConfigurations[currentImage] || [];

    return (
      <>
        {dots.map((dot) => (
          <div
            key={dot.id || dot.className}
            className={dot.className}
            style={dot.position}
          >
            {activeTooltip === dot.id && (
              <div className={styles.tooltipText}>
                <h3>{dot.tooltip}</h3>
                <p>{dot.description}</p>
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  const handleNext = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setShowImageViewer(false);
  };

  const handleSectionClick = (sectionId) => {
    setImageLoaded(false);
    const index = allImages.findIndex(img => img.id === sectionId);
    if (index !== -1) {
      setCurrentImageIndex(index);
      setShowImageViewer(true);
    }
  };

  const handleMouseEnterWithDelay = (section) => {
    setIsMouseEnterActive(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setImageLoaded(false);
      handleSectionClick(section);
    }, 3000);
  };

  const handleMouseLeave = () => {
    setIsMouseEnterActive(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showImageViewer) {
          setShowImageViewer(false);
          navigate("/smart-solutions-building_new_ver02");
        } else {
          navigate("/smart-solutions-building_new");
        }
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, showImageViewer]);

  return (
    <>
      <Navbar />
      <section className={styles.container}>
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <img
              src="/image/SmatOverlay.png"
              alt="Smart Building"
              className={styles.aboutImage}
            />
            <button 
              className={styles.closeButton} 
              onClick={() => navigate("/")}
              aria-label="Close overview"
            >
              ×
            </button>

            <div
              id="RenewableEnergy"
              className={styles.redDot_RenewableEnergyIntegrationWrapper}
              onMouseEnter={() => handleMouseEnterWithDelay("renewableEnergy")}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleSectionClick("renewableEnergy")}
            />

            <div 
              id="Iot"
              className={styles.redDot_IotWrapper}
              onClick={() => handleSectionClick('iot')}
              onMouseEnter={() => handleMouseEnterWithDelay("iot")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Access Control Systems"
              className={styles.redDot_AccessControlSystemsWrapper}
              onClick={() => handleSectionClick('Access Control Systems')}
              onMouseEnter={() => handleMouseEnterWithDelay("Access Control Systems")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Security System"
              className={styles.redDot_SurveillanceSecurityWrapper}
              onClick={() => handleSectionClick('Security System')}
              onMouseEnter={() => handleMouseEnterWithDelay("Security System")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Smart Lighting"
              className={styles.redDot_LightingWrapper}
              onClick={() => handleSectionClick('Smart Lighting')}
              onMouseEnter={() => handleMouseEnterWithDelay("Smart Lighting")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Building Automation System"
              className={styles.redDot_BuildingAutomationWrapper}
              onClick={() => handleSectionClick('Building Automation System')}
              onMouseEnter={() => handleMouseEnterWithDelay("Building Automation System")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Motion Sensors"
              className={styles.redDot_MotionSensorsWrapper}
              onClick={() => handleSectionClick('Motion Sensors')}
              onMouseEnter={() => handleMouseEnterWithDelay("Motion Sensors")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Smart Parking Management"
              className={styles.redDot_SmartParkingWrapper}
              onClick={() => handleSectionClick('Smart Parking Management')}
              onMouseEnter={() => handleMouseEnterWithDelay("Smart Parking Management")}
              onMouseLeave={handleMouseLeave}
            />

            {showImageViewer && (
              <div className={styles.imageViewerOverlay}>
                <div className={styles.viewerContent}>
                  <img
                    src={allImages[currentImageIndex].src}
                    alt={allImages[currentImageIndex].title}
                    className={`${styles.viewerImage} ${imageLoaded ? styles.loaded : ''}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                  <DynamicRedDots currentImage={allImages[currentImageIndex].id} />
                  {imageLoaded && (
                    <div className={`${styles.navigationButtons} ${imageLoaded ? styles.visible : ''}`}>
                      <button 
                        className={styles.BacknavButton}
                        onClick={handlePrevious}
                      >
                        Back
                      </button>
                      <button 
                        className={styles.NextnavButton}
                        onClick={handleNext}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Contact />
    </>
  );
};

export default SmartSolutions_Building_New_ver02;