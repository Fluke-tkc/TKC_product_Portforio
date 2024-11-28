import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";
import styles from "./SmartSolutions_Utility_New_ver02.module.css";

export const SmartSolutions_Utility_New_ver02 = () => {
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
      id: 'Demand Response(DR)Energy Management System(EMS)',
      src: "/image/U_3.png",
      title: "Demand Response(DR)Energy Management System(EMS)",
      description: "Optimizes energy use by reducing consumption during peak times, easing grid load and cutting costs"
    },
    {
      id: 'Renewable Energy',
      src: "/image/U_4.png",
      title: "Renewable Energy",
      description: "Integrating renewable energy into the grid enhances clean energy share"
    },
    {
      id: 'Advanced Mtering Infrastructure(AMI)',
      src: "/image/U_5.png",
      title: "Advanced Mtering Infrastructure(AMI)",
      description: "Technology deploying smart meters that seamlessly relay real-time energy usage between consumers and providers"
    },
    {
      id: 'Microgrid Prosumer',
      src: "/image/U_6.png",
      title: "Microgrid Prosumer",
      description: "Efficient Local Energy Management and independently from the main grid"
    },
    {
      id: 'EV Integration',
      src: "/image/U_7.png",
      title: "EV Integration",
      description: "Elegantly connects electric vehicles to the grid"
    },
    {
      id: 'EnergyStorageSysem',
      src: "/image/U_8.png",
      title: "Energy Storage System",
      description: "Ensuring Stable Electricity Supply"
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
      'Demand Response(DR)Energy Management System(EMS)': [
        {
          className: styles.redDot_RenewableEnergyIntegrationWrapper,
          position: { top: '25%', left: '10%' }
        }
      ],
      'Renewable Energy': [
        {
          className: styles.redDot_IotWrapper,
          position: { top: '25%', left: '95%' }
        }
      ],
      'Advanced Mtering Infrastructure(AMI)': [
        {
          className: styles.redDot_AccessControlSystemsWrapper,
          position: { top: '15%', left: '93.2%' }
        }
      ],
      'Microgrid Prosumer': [
        {
          className: styles.redDot_SurveillanceSecurityWrapper,
          position: { top: '90%', left: '80%' }
        }
      ],
      'EV Integration': [
        {
          className: styles.redDot_LightingWrapper,
          position: { top: '78%', left: '50%' }
        }
      ],
      'EnergyStorageSysem': [
        {
          className: styles.redDot_BuildingAutomationWrapper,
          position: { top: '80%', left: '21%' }
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
          navigate("/smart-solutions-utility_new_ver02");
        } else {
          navigate("/smart-solutions-utility_new");
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
              src="/image/U_2.png"
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
              id="Demand Response(DR)Energy Management System(EMS)"
              className={styles.redDot_RenewableEnergyIntegrationWrapper}
              onMouseEnter={() => handleMouseEnterWithDelay("Demand Response(DR)Energy Management System(EMS)")}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleSectionClick("Demand Response(DR)Energy Management System(EMS)")}
            />

            <div 
              id="Renewable Energy"
              className={styles.redDot_IotWrapper}
              onClick={() => handleSectionClick('Renewable Energy')}
              onMouseEnter={() => handleMouseEnterWithDelay("Renewable Energy")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Advanced Mtering Infrastructure(AMI)"
              className={styles.redDot_AccessControlSystemsWrapper}
              onClick={() => handleSectionClick('Advanced Mtering Infrastructure(AMI)')}
              onMouseEnter={() => handleMouseEnterWithDelay("Advanced Mtering Infrastructure(AMI)")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Microgrid Prosumer"
              className={styles.redDot_SurveillanceSecurityWrapper}
              onClick={() => handleSectionClick('Microgrid Prosumer')}
              onMouseEnter={() => handleMouseEnterWithDelay("Microgrid Prosumer")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="EV Integration"
              className={styles.redDot_LightingWrapper}
              onClick={() => handleSectionClick('EV Integration')}
              onMouseEnter={() => handleMouseEnterWithDelay("EV Integration")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="EnergyStorageSysem"
              className={styles.redDot_BuildingAutomationWrapper}
              onClick={() => handleSectionClick('EnergyStorageSysem')}
              onMouseEnter={() => handleMouseEnterWithDelay("EnergyStorageSysem")}
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

export default SmartSolutions_Utility_New_ver02;