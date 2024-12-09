import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";
import styles from "./SmartSolutions_Hospital_New_ver02.module.css";
import { useLanguage } from "../../contexts/LanguageContext";

export const SmartSolutions_Hospital_New_ver02 = () => {
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
  const { images } = useLanguage();

  const allImages = [
    {
      id: 'renewableEnergy',
      src:  images.Data_Analytics_Knowledge_Management,
      title: "Data Analytics & Knowledge Management",
      description: "Leveraging Data to Drive Informed Decisions and Organizational"
    },
    {
      id: 'iot',
      src:  images.Smart_Diagnostics_Treatment,
      title: "Smart Diagnostics & Treatment",
      description: "Advanced AI tools assist in precise diagnostics and treatment"
    },
    {
      id: 'Access Control Systems',
      src:  images.Smart_Safety_Convenience_Systems,
      title: "Smart Safety & Convenience",
      description: "Enhanced Safety, Security, and Comfort through Technology"
    },
    {
      id: 'Security System',
      src:  images.Integrated_Patient_Care,
      title: "Integrated Patient Care",
      description: "A Coordinated, Technology-Driven Approach to Healthcare"
    },
    {
      id: 'Smart Lighting',
      src: images.Smart_Hospital_Management_Systems,
      title: "Smart Hospital Management",
      description: "Digital Solutions for Enhanced Patient Service"
    }
  ];

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
          position: { top: '25%', left: '18%' }
        }
      ],
      'iot': [
        {
          className: styles.redDot_IotWrapper,
          position: { top: '76%', left: '22%' }
        }
      ],
      'Access Control Systems': [
        {
          id: 'access-control',
          className: styles.redDot_AccessControlSystemsWrapper,
          position: { top: '80%', left: '44%' }
        }
      ],
      'Security System': [
        {
          id: 'security-system',
          className: styles.redDot_SurveillanceSecurityWrapper,
          position: { top: '27%', left: '72%' }
        }
      ],
      'Smart Lighting': [
        {
          id: 'smart-lighting',
          className: styles.redDot_LightingWrapper,
          position: { top: '36%', left: '64%' }
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
          navigate("/smart-solutions-hospital_new_ver02");
        } else {
          navigate("/smart-solutions-hospital_new");
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
              src={images.smart_solutions_Hospital_new_ver2_0}
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

export default SmartSolutions_Hospital_New_ver02;