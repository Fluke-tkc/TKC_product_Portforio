import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";
import styles from "./SmartSolutions_Autonomous_New_ver02.module.css";
import { useLanguage } from "../../contexts/LanguageContext";
export const SmartSolutions_Autonomous_New_ver02 = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showPostTutorialImage, setShowPostTutorialImage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isMouseEnterActive, setIsMouseEnterActive] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const { images } = useLanguage();

  const allImages = [
    {
      id: 'renewableEnergy',
      src: images.Autonomous_Security_Systems,
      title: "Autonomous Security Systems",
      description: "Sustainable energy solutions for smart buildings"
    },
    {
      id: 'iot',
      src: images.Autonomous_Vehicles,
      title: "Autonomous Vehicles",
      description: "Connected devices and smart sensors"
    },
   
  
     {
       id: 'Access Control Systems',
      src: images.Autonomous_Industrial_Robot,
       title: "Autonomous Industrial Robot",
     description: "Advanced security access management"
    },
 
     {
       id: 'Security System',
       src: images.Autonomous_Service_Robot,
       title: "Autonomous Service Robot",
       description: "Comprehensive building security"
     },
   // {
   //   id: 'Smart Lighting',
   //   src: "/image/P_3.png",
   //   title: "Smart Lighting",
   //   description: "Intelligent lighting control"
  //  },
    // {
    //   id: 'Building Automation System',
    //   src: "/image/P_7.png",
    //   title: "Building Automation",
    //   description: "Automated building management"
    // },
   // {
    //  id: 'Motion Sensors',
    //  src: "/image/P_4.png",
    //  title: "Motion Detection",
    //  description: "Advanced motion sensing technology"
   // },
    // {
    //   id: 'Smart Parking Management',
    //   src: "/image/P_8.png",
    //   title: "Smart Parking",
    //   description: "Intelligent parking solutions"
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
      'renewableEnergy': [
        {
          className: styles.redDot_RenewableEnergyIntegrationWrapper,
          position: { top: '20%', left: '8%' }
        }
      ],
      'iot': [
        {
          className: styles.redDot_IotWrapper,
          position: { top: '70%', left: '10%' }
        }
      ],
    
         'Access Control Systems': [
       {
           id: 'access-control',
           className: styles.redDot_AccessControlSystemsWrapper,
           position: { top: '30%', left: '93%' }
         }
       ],
       'Security System': [
         {
           id: 'security-system',
           className: styles.redDot_SurveillanceSecurityWrapper,
           position: { top: '70%', left: '84%' }
         }
       ],
  
     
      // 'Smart Lighting': [
      //   {
      //     id: 'smart-lighting',
      //     className: styles.redDot_LightingWrapper,
      //     position: { top: '20%', left: '93.5%' }
      //   }
      // ],
      // 'Building Automation System': [
      //   {
      //     id: 'building-automation',
      //     className: styles.redDot_BuildingAutomationWrapper,
      //     position: { top: '88%', left: '20%' }
      //   }
      // ],
      // 'Motion Sensors': [
      //   {
      //     id: 'motion-sensors',
      //     className: styles.redDot_MotionSensorsWrapper,
      //     position: { top: '83%', left: '51.8%' }
      //   }
      // ],
      // 'Smart Parking Management': [
      //   {
      //     id: 'smart-parking',
      //     className: styles.redDot_SmartParkingWrapper,
      //     position: { top: '82%', left: '85.8%' }
      //   }
      // ]
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
          navigate("/smart-solutions_autonomous_new_ver02");
        } else {
          navigate("/smart-solutions_autonomous_new");
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
              <div className={styles.languageTabs}>
                                  <button
                                    className={`${styles.languageTab} ${language === 'en' ? styles.active : ''}`}
                                    onClick={() => language !== 'en' && toggleLanguage()}
                                  >
                                    EN
                                  </button>
                                  <button
                                    className={`${styles.languageTab} ${language === 'th' ? styles.active : ''}`}
                                    onClick={() => language !== 'th' && toggleLanguage()}
                                  >
                                    TH
                                  </button>
                                </div>
            <img
              src={images.smart_solutions_Autonomous_new_ver2_0}
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

export default SmartSolutions_Autonomous_New_ver02;