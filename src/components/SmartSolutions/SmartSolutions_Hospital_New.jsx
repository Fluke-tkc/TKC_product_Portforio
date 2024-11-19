import React, { useState, useEffect ,useRef } from "react";
import styles from "./SmartSolutions_Hospital_New.module.css";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";
export const SmartSolutions_Hospital_New = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showPostTutorialImage, setShowPostTutorialImage] = useState(false);

  
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    images: [],
    position: { x: 0, y: 0 },
    customClass: '', // For custom positioning classes
    size: { width: 800, height: 600 } // Default size
  });

  const containerRef = useRef(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  // Example position configurations for different sections
  // const modalPositions = {
  //   renewableEnergy: {
  //     x: 70, 
  //     y: 60,  
  //     size: { width: 1000, height: 1000 }
  //   },
  //   iot: {
  //     x: 30,
  //     y: 40,
  //     size: { width: 700, height: 400 }
  //   },
  //   security: {
  //     x: 60,
  //     y: 60,
  //     size: { width: 900, height: 600 }
  //   },
   
  // };


  const allImages = [
    {
      id: 'renewableEnergy',
      src: "/image/P_1.png",
      
    },
    {
      id: 'iot',
      src: "/image/P_2.png",
    
    },
    {
      id: 'Access Control Systems',
      src: "/image/P_3.png",
    
    },
    {
      id: 'Security System',
      src: "/image/P_4.png",
     
    },
    {
      id: 'Smart Lighting',
      src: "/image/P_5.png",
     
    },
    {
      id: 'Building Automation System',
      src: "/image/P_6.png",
      
    },
    {
      id: 'Motion Sensors',
      src: "/image/P_7.png",
      
    },
    {
      id: 'Smart Parking Management',
      src: "/image/P_8.png",
     
    }
    // เพิ่มรูปภาพอื่นๆ ตามต้องการ
  ];

  // ฟังก์ชันสำหรับจัดการการนำทาง
const handleNext_Ver2 = () => {
  setCurrentImageIndex((prevIndex) => 
    prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
  );
};
const handlePrevious_Ver2 = () => {
  // if (currentImageIndex === 0) {
    setShowImageViewer(false); // ปิดตัวแสดงรูปภาพถ้าอยู่ที่รูปแรกและกดย้อนกลับ
  // } else {
  //   setCurrentImageIndex((prevIndex) => prevIndex - 1);
  // }
};
const handleSectionClick_Ver2 = (section) => {
  const index = allImages.findIndex(img => img.id === section);
  if (index !== -1) {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  }
};
  const handleCloseModal = () => {
 
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Updated click handler with position configuration
  const handleSectionClick = (section, images) => {
    const positionConfig = modalPositions[section];
    
    setModalConfig({
      isOpen: true,
      images: images,
      position: {
        x: positionConfig.x,
        y: positionConfig.y
      },
      size: positionConfig.size
    });
  };


 
  const tutorialSteps = [
    {
      target: 'RenewableEnergy',
      title: 'Renewable Energy Integration',
      content: 'Integrating Renewable Energy into Building Systems'
    },
    {
      target: 'Iot',
      title: 'Iot',
      content: 'Connected Devices and Sensors for Data Collection and Transmission​'
    },
    {
      target: 'Access Control Systems​',
      title: 'Access Control Systems​',
      content: 'Technologies for Secure Access Management​'
    },
    {
      target: 'Surveillance and Security System​',
      title: 'Surveillance and Security System​',
      content: 'AI-Enhanced Surveillance, Biometric Access Control, and Advanced Fire Detection​​'
    },
    {
      target: 'Lighting',
      title: 'Smart Lighting',
      content: 'Adaptive Lighting System'
    },
    {
      target: 'Building Automation System​',
      title: 'Building Automation System​',
      content: 'Efficient Control of HVAC, Electrical, Security, and Water Management​'
    },
    {
      target: 'Motion Sensors​',
      title: 'Motion Sensors​',
      content: 'Future Trends in Motion Detection​'
    },
    {
      target: 'Smart Parking Management​',
      title: 'Smart Parking Management​',
      content: 'Efficient Parking Management and Availability Tracking​​'
    },
  ];
  const handleTutorialEnd = () => {
    setShowTutorial(false);
    //setShowPostTutorialImage(true);
  };

  const handleTutorialClick = (e) => {
    if (e.target.classList.contains(styles.skipButton) || 
        e.target.classList.contains(styles.primaryButton)) {
      return;
    }
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleTutorialEnd(); 
    }
  };
  const handleClosePostTutorialImage = () => {
    // setShowPostTutorialImage(false);
    navigate("/smart-solutions-hospital_new_ver02");
  };
  const handleNext = (e) => {
    e.stopPropagation();
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleTutorialEnd();
    }
  };

   const handleSkip = (e) => {
    e.stopPropagation();
    handleTutorialEnd();
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);


 
   // Example handlers for different sections
   const handleLearnMoreClick_smart_BuildingTo_RenewableEnergyIntegration = () => {
    handleSectionClick_Ver2('renewableEnergy', [
      {
        // src: "/image/DataRenewableEnergyIntegration.png",
        // alt: "Solar Farm"
      }
      
    ]);
  };

  const handleLearnMoreClick_smart_BuildingTo_Iot = () => {
    handleSectionClick_Ver2('iot', [
      {
        // src: "/image/Smart_Utility_Grid.jpg",
        // alt: "IoT System"
      }
    ]);
  };

  const handleLearnMoreClick_smart_BuildingTo_AccessControlSystems = () => {
    handleSectionClick_Ver2 ('Access Control Systems', [
      {
        // src: "/image/SecuritySystem.png",
        // alt: "Security System"
      }
    ]);
  };
  const handleLearnMoreClick_smart_BuildingTo_SurveillanceandSecuritySystem = () => {
    handleSectionClick_Ver2 ('Security System', [
      {
        // src: "/image/SecuritySystem.png",
        // alt: "Security System"
      }
    ]);
  };
  const handleLearnMoreClick_smart_BuildingTo_Lighting = () => {
    handleSectionClick_Ver2 ('Smart Lighting', [
      {
        // src: "/image/SecuritySystem.png",
        // alt: "Security System"
      }
    ]);
  };
  
  const handleLearnMoreClick_smart_BuildingTo_BuildingAutomationSystem = () => {
    handleSectionClick_Ver2 ('Building Automation System', [
      {
        // src: "/image/SecuritySystem.png",
        // alt: "Security System"
      }
    ]);
  };
  
  const handleLearnMoreClick_smart_BuildingTo_MotionSensors = () => {
    handleSectionClick_Ver2 ('Motion Sensors', [
      {
        // src: "/image/SecuritySystem.png",
        // alt: "Security System"
      }
    ]);
  };
  
   
  const handleLearnMoreClick_smart_BuildingTo_SmartParkingManagement = () => {
    handleSectionClick_Ver2 ('Smart Parking Management', [
      {
        // src: "/image/SecuritySystem.png",
        // alt: "Security System"
      }
    ]);
  };
  
  
  //const handleLearnMoreClick_smart_BuildingTo_AccessControlSystems = () => {
    // navigate("/smart-solutions-building", { state: { scrollTo: 'Access Control Systems' } });
 // };
 // const handleLearnMoreClick_smart_BuildingTo_SurveillanceandSecuritySystem = () => {
    // navigate("/smart-solutions-building", { state: { scrollTo: 'Surveillance and Security System' } });
 // };
 // const handleLearnMoreClick_smart_BuildingTo_Lighting = () => {
    // navigate("/smart-solutions-building", { state: { scrollTo: 'Lighting' } });
 // };
 // const handleLearnMoreClick_smart_BuildingTo_BuildingAutomationSystem = () => {
    // navigate("/smart-solutions-building", { state: { scrollTo: 'Building Automation System' } });
//};
  //const handleLearnMoreClick_smart_BuildingTo_MotionSensors = () => {
    // navigate("/smart-solutions-building", { state: { scrollTo: 'Motion Sensors' } });
//  };
//  const handleLearnMoreClick_smart_BuildingTo_SmartParkingManagement = () => {
    // navigate("/smart-solutions-building", { state: { scrollTo: 'Smart Parking Management' } });
 // };

// Add function to handle image resize
const handleImageResize = (e) => {
  const image = e.target;
  const container = image.parentElement;
  const rect = container.getBoundingClientRect();
  
  const maxWidth = window.innerWidth * 0.8;
  const maxHeight = window.innerHeight * 0.8;
  
  if (rect.width > maxWidth) {
    container.style.width = `${maxWidth}px`;
  }
  if (rect.height > maxHeight) {
    container.style.height = `${maxHeight}px`;
  }
};

return (
  <>
    <Navbar />
    <section className={styles.container} id="about">
      <div className={styles.content}>
        <div className={styles.imageContainer}>
          {/* Main Title Overlay Text */}
          {/* <div className={styles.overlayText}>Efficient Building Management</div> */}
          
          {/* Main Background Image */}
          <img
            src="/image/SmartHospital.png"
            onClick={handleClosePostTutorialImage}
            alt="Smart Building"
            className={styles.aboutImage}
          />
            {/* <button 
                 className={styles.closeButton} 
                 onClick={handleClosePostTutorialImage}
                 aria-label="Close overview"
                 >
                   ×
                </button> */}
          
          {/* Red Dots with Enhanced Tooltips - Only show when post tutorial image is not showing */}
          { (
            <>
              {/* Renewable Energy Integration Dot */}
              <div 
                id="RenewableEnergy"
                className={styles.redDot_RenewableEnergyIntegrationWrapper}
                // onClick={handleLearnMoreClick_smart_BuildingTo_RenewableEnergyIntegration}
                onClick={handleClosePostTutorialImage}
              >
                 <div className={styles.tooltipText}>
                  <h3>Renewable Energy Integration</h3>
                  <p>Integrating Renewable Energy into Building Systems</p>
                </div> 
              </div>

              {/* IoT Dot */}
              <div 
                id="Iot"
                className={styles.redDot_IotWrapper}
                // onClick={handleLearnMoreClick_smart_BuildingTo_Iot}
                onClick={handleClosePostTutorialImage}
              >
                 <div className={styles.tooltipText}>
                  <h3>IoT</h3>
                  <p>Connected Devices and Sensors for Data Collection and Transmission</p>
                </div> 
              </div>

              {/* Access Control Systems Dot */}
              <div 
                id="AccessControlSystems"
                className={styles.redDot_AccessControlSystemsWrapper}
                // onClick={handleLearnMoreClick_smart_BuildingTo_AccessControlSystems}
                onClick={handleClosePostTutorialImage}
              >
                 <div className={styles.tooltipText}>
                  <h3>Access Control Systems</h3>
                  <p>Technologies for Secure Access Management</p>
                </div> 
              </div>

              {/* Surveillance and Security Dot */}
              <div 
                id="SurveillanceAndSecurity"
                className={styles.redDot_SurveillanceSecurityWrapper}
                // onClick={handleLearnMoreClick_smart_BuildingTo_SurveillanceandSecuritySystem}
                onClick={handleClosePostTutorialImage}
              >
                 <div className={styles.tooltipText}>
                  <h3>Surveillance and Security System</h3>
                  <p>AI-Enhanced Surveillance, Biometric Access Control, and Advanced Fire Detection</p>
                </div> 
              </div>

              {/* Smart Lighting Dot */}
              <div 
                id="Lighting"
                className={styles.redDot_LightingWrapper}
                // onClick={handleLearnMoreClick_smart_BuildingTo_Lighting}
                onClick={handleClosePostTutorialImage}
              >
                 <div className={styles.tooltipText}>
                  <h3>Smart Digital Signage and Lighting​</h3>
                  <p>Dynamic and campaign launches content, Adaptive Lighting System ​</p>
                </div> 
              </div>

              {/* Building Automation Dot */}
              {/* <div 
                id="BuildingAutomation"
                className={styles.redDot_BuildingAutomationWrapper}
                // onClick={handleLearnMoreClick_smart_BuildingTo_BuildingAutomationSystem}
                onClick={handleClosePostTutorialImage}
              >
                 <div className={styles.tooltipText}>
                  <h3>Building Automation System</h3>
                  <p>Efficient Control of HVAC, Electrical, Security, and Water Management</p>
                </div> 
              </div> */}

              {/* Motion Sensors Dot */}
              {/* <div 
                id="MotionSensors"
                className={styles.redDot_MotionSensorsWrapper}
                // onClick={handleLearnMoreClick_smart_BuildingTo_MotionSensors}
                onClick={handleClosePostTutorialImage}
              >
                 <div className={styles.tooltipText}>
                  <h3>Motion Sensors</h3>
                  <p>Future Trends in Motion Detection</p>
                </div> 
              </div> */}

              {/* Smart Parking Dot */}
              {/* <div 
                id="SmartParking"
                className={styles.redDot_SmartParkingWrapper}
                // onClick={handleLearnMoreClick_smart_BuildingTo_SmartParkingManagement}
                onClick={handleClosePostTutorialImage}
              >
                 <div className={styles.tooltipText}>
                  <h3>Smart Parking Management</h3>
                  <p>Efficient Parking Management and Availability Tracking</p>
                </div> 
              </div> */}
            </>
          )}  

          {/* Post Tutorial Image Overlay - Shows after tutorial ends */}
          {/* {showPostTutorialImage && (
              <div className={styles.postTutorialOverlay}>
                <img
                 src="/image/SmatOverlay.png"
                 alt="Smart Building Features Overview"
                 className={styles.postTutorialImage}
                 />  
                 <button 
                 className={styles.closeButton} 
                 onClick={handleClosePostTutorialImage}
                 aria-label="Close overview"
                 >
                   ×
                </button>
                </div>
              )} */}

          {/* Tutorial Overlay - Shows during tutorial */}
          {/* {showTutorial && (
            <div 
              className={styles.tutorialContainer}
              onClick={handleTutorialClick}
            >
              
              <div className={styles.overlay} />
              
             
              <div 
                className={`${styles.spotlight} ${
                  styles[`spotlightStep${currentStep + 1}`]
                }`}
              />
              
              
              <div 
                className={`${styles.messageBox} ${
                  styles[`messageBoxStep${currentStep + 1}`]
                }`}
              >
                <h3 className={styles.messageTitle}>
                  {tutorialSteps[currentStep].title}
                </h3>
                <p className={styles.messageContent}>
                  {tutorialSteps[currentStep].content}
                </p>
                <div className={styles.buttonContainer}>
                  <button 
                    className={styles.primaryButton}
                    onClick={handleNext}
                  >
                    {currentStep < tutorialSteps.length - 1 ? 'More' : 'เสร็จสิ้น'}
                  </button>
                </div>
              </div>

             
              <button 
                className={styles.skipButton} 
                onClick={handleSkip}
              >
                Skip Tutorial
              </button>
            </div>
          )} */}

          
            {/* Modal */}
            {/* {modalConfig.isOpen && (
  <div 
    className={styles.modalOverlay} 
    onClick={handleCloseModal}  // คลิกที่ไหนก็ได้จะทำงาน
  >
    <div 
      className={styles.imageModal}
      
      style={{
        left: `${modalConfig.position.x}%`,
        top: `${modalConfig.position.y}%`,
        width: `${modalConfig.size.width}px`,
        height: `${modalConfig.size.height}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <button 
        className={styles.closeModalButton}
        onClick={handleCloseModal}
      >
        ×
      </button>
      <div className={styles.modalContent}>
        {modalConfig.images.map((image, index) => (
          <div 
            key={index} 
            className={styles.modalImageWrapper}
          >
            <img
              src={image.src}
              alt={image.alt}
              className={styles.modalImage}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)} */}
     {/* Image Viewer Overlay */}
     {showImageViewer && (
  <div className={styles.imageViewerOverlay}>
    <img
      src={allImages[currentImageIndex].src}
      alt={allImages[currentImageIndex].alt}
      className={styles.viewerImage}
    />
    <div className={styles.navigationButtons}>
      <button 
        className={styles.BacknavButton}
        onClick={handlePrevious_Ver2}
      >
        Back
      </button>
      <button 
        className={styles.NextnavButton}
        onClick={handleNext_Ver2}
      >
        Next
      </button>
    </div>
  </div>
)}
</div>
</div>
</section>
<Contact />
{/* <Contact /> */}
</>
);
}
export default SmartSolutions_Hospital_New;