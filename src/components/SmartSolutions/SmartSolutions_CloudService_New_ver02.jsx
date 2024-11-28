import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";
import styles from "./SmartSolutions_CloudService_New_ver02.module.css";

export const SmartSolutions_CloudService_New_ver02 = () => {
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
      id: 'Cloud Data Center Solutions',
      src: "/image/CS_1.png",
      title: "Cloud Data Center Solutions",
      description: "Cloud Solutions"
    },
    {
      id: 'Big Data Analytics on Cloud',
      src: "/image/CS_2.png",
      title: "Big Data Analytics on Cloud",
      description: "Connected devices and smart sensors"
    },
    {
      id: 'AI Services on Cloud',
      src: "/image/CS_3.png",
      title: "AI Services on Cloud",
      description: "AI Services"
    },
    {
      id: 'Security and Compliance Services',
      src: "/image/CS_4.png",
      title: "Security and Compliance Services",
      description: "Security Services"
    },
    {
      id: 'ERP on Cloud',
      src: "/image/CS_5.png",
      title: "ERP on Cloud",
      description: "Systems seamlessly integrate business functions"
    },
    {
      id: 'Cloud-Based Call Center / Chatbot',
      src: "/image/CS_6.png",
      title: "Cloud-Based Call Center / Chatbot",
      description: "Support Center"
    },
    {
      id: 'Blockchain',
      src: "/image/CS_7.png",
      title: "Blockchain",
      description: "Decentralized data storage"
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
      'Cloud Data Center Solutions': [
        {
          className: styles.redDot_RenewableEnergyIntegrationWrapper,
          position: { top: '75%', left: '30%' }
        }
      ],
      'Big Data Analytics on Cloud': [
        {
          id: 'big-data',
          className: styles.redDot_IotWrapper,
          position: { top: '65%', left: '80%' }
        }
      ],
      'AI Services on Cloud': [
        {
          id: 'ai-services',
          className: styles.redDot_AccessControlSystemsWrapper,
          position: { top: '10%', left: '33%' }
        }
      ],
      'Security and Compliance Services': [
        {
          id: 'security-services',
          className: styles.redDot_SurveillanceSecurityWrapper,
          position: { top: '35%', left: '83.8%' }
        }
      ],
      'ERP on Cloud': [
        {
          id: 'erp-cloud',
          className: styles.redDot_LightingWrapper,
          position: { top: '40%', left: '15%' }
        }
      ],
      'Cloud-Based Call Center / Chatbot': [
        {
          id: 'call-center',
          className: styles.redDot_BuildingAutomationWrapper,
          position: { top: '10%', left: '75.3%' }
        }
      ],
      'Blockchain': [
        {
          id: 'blockchain',
          className: styles.redDot_MotionSensorsWrapper,
          position: { top: '55%', left: '67%' }
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
          navigate("/smart-solutions-cloudservice_new_ver02");
        } else {
          navigate("/smart-solutions-cloudservice_new");
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
              src="/image/smart_cloudservice_2.png"
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
              id="Cloud Data Center Solutions"
              className={styles.redDot_RenewableEnergyIntegrationWrapper}
              onMouseEnter={() => handleMouseEnterWithDelay("Cloud Data Center Solutions")}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleSectionClick("Cloud Data Center Solutions")}
            />
 
            <div 
              id="Big Data Analytics on Cloud"
              className={styles.redDot_IotWrapper}
              onClick={() => handleSectionClick('Big Data Analytics on Cloud')}
              onMouseEnter={() => handleMouseEnterWithDelay("Big Data Analytics on Cloud")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="AI Services on Cloud"
              className={styles.redDot_AccessControlSystemsWrapper}
              onClick={() => handleSectionClick('AI Services on Cloud')}
              onMouseEnter={() => handleMouseEnterWithDelay("AI Services on Cloud")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Security and Compliance Services"
              className={styles.redDot_SurveillanceSecurityWrapper}
              onClick={() => handleSectionClick('Security and Compliance Services')}
              onMouseEnter={() => handleMouseEnterWithDelay("Security and Compliance Services")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="ERP on Cloud"
              className={styles.redDot_LightingWrapper}
              onClick={() => handleSectionClick('ERP on Cloud')}
              onMouseEnter={() => handleMouseEnterWithDelay("ERP on Cloud")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Cloud-Based Call Center / Chatbot"
              className={styles.redDot_BuildingAutomationWrapper}
              onClick={() => handleSectionClick('Cloud-Based Call Center / Chatbot')}
              onMouseEnter={() => handleMouseEnterWithDelay("Cloud-Based Call Center / Chatbot")}
              onMouseLeave={handleMouseLeave}
            />

            <div 
              id="Blockchain"
              className={styles.redDot_MotionSensorsWrapper}
              onClick={() => handleSectionClick('Blockchain')}
              onMouseEnter={() => handleMouseEnterWithDelay("Blockchain")}
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

export default SmartSolutions_CloudService_New_ver02;