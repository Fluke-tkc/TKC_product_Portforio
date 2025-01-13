import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";
import styles from "./SmartSolutions_Logistics_New_ver02.module.css";
import { useLanguage } from "../../contexts/LanguageContext";

export const SmartSolutions_Logistics_New_ver02 = () => {
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
      id: 'Cloud Data Center Solutions',
      src: images.SmartScan,
      title: "Cloud Data Center Solutions",
      description: "Cloud Solutions"
    },
    {
      id: 'Big Data Analytics on Cloud',
      src: images.RouteOptimization,
      title: "Big Data Analytics on Cloud",
      description: "Connected devices and smart sensors"
    },
    {
      id: 'AI Services on Cloud',
      src: images.IntelligentCargoVolumeAnalysis,
      title: "AI Services on Cloud",
      description: "AI Services"
    },
    {
      id: 'Security and Compliance Services',
      src: images.TransferDelivery,
      title: "Security and Compliance Services",
      description: "Security Services"
    },
    {
      id: 'ERP on Cloud',
      src: images.PointofSale,
      title: "ERP on Cloud",
      description: "Systems seamlessly integrate business functions"
    },
    // {
    //   id: 'Cloud-Based Call Center / Chatbot',
    //   src: images.Cloud_Based_Call_Center_Chatbot,
    //   title: "Cloud-Based Call Center / Chatbot",
    //   description: "Support Center"
    // },
    // {
    //   id: 'Blockchain',
    //   src: images.Blockchain,
    //   title: "Blockchain",
    //   description: "Decentralized data storage"
    // }
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
          position: { top: '14%', left: '42%' }
        }
      ],
      'Big Data Analytics on Cloud': [
        {
          id: 'big-data',
          className: styles.redDot_IotWrapper,
          position: { top: '20%', left: '27%' }
        }
      ],
      'AI Services on Cloud': [
        {
          id: 'ai-services',
          className: styles.redDot_AccessControlSystemsWrapper,
          position: { top: '26%', left: '82%' }
        }
      ],
      'Security and Compliance Services': [
        {
          id: 'security-services',
          className: styles.redDot_SurveillanceSecurityWrapper,
          position: { top: '53%', left: '7%' }
        }
      ],
      'ERP on Cloud': [
        {
          id: 'erp-cloud',
          className: styles.redDot_LightingWrapper,
          position: { top: '75%', left: '80%' }
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
          navigate("/smart-solutions-logistics_new_ver02");
        } else {
          navigate("/smart-solutions-logistics_new");
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
              src={images.smart_solutions_Logistics_new_ver2_0}
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

            {/* <div 
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
            /> */}

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

export default SmartSolutions_Logistics_New_ver02;