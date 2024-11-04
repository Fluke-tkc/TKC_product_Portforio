import React, { useState, useEffect } from "react";
import styles from "./SmartSolutions_Building_New.module.css";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";
export const SmartSolutions_Building = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

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

  const handleTutorialClick = (e) => {
    if (e.target.classList.contains(styles.skipButton) || 
        e.target.classList.contains(styles.primaryButton)) {
      return;
    }
    
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handleSkip = (e) => {
    e.stopPropagation();
    setShowTutorial(false);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  const handleLearnMoreClick_smart_BuildingTo_RenewableEnergyIntegration = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'renewableEnergy' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_Iot = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Iot' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_AccessControlSystems = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Access Control Systems' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_SurveillanceandSecuritySystem = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Surveillance and Security System' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_Lighting = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Lighting' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_BuildingAutomationSystem = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Building Automation System' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_MotionSensors = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Motion Sensors' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_SmartParkingManagement = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Smart Parking Management' } });
  };

  return (
    <>
     <Navbar />
    <section className={styles.container} id="about">
      
      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <img
            src="/image/SmartBuilding.jpg"
            alt="Smart Building"
            className={styles.aboutImage}
          />
           
          {/* Red Dots with Enhanced Tooltips */}
          <div 
            id="RenewableEnergy"
            className={styles.redDot_RenewableEnergyIntegrationWrapper} 
            onClick={handleLearnMoreClick_smart_BuildingTo_RenewableEnergyIntegration}
          >
            <div className={styles.tooltipText}>
              <h3>Renewable Energy Integration</h3>
              <p>Integrating Renewable Energy into Building Systems</p>
              <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_RenewableEnergyIntegration}>
                ต่อไป
              </button>
            </div>
          </div>

          <div 
            id="Iot"
            className={styles.redDot_IotWrapper} 
            onClick={handleLearnMoreClick_smart_BuildingTo_Iot}
          >
            <div className={styles.tooltipText}>
              <h3>IoT</h3>
              <p>Connected Devices and Sensors for Data Collection and Transmission</p>
              <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_Iot}>
                ต่อไป
              </button>
            </div>
          </div>

          <div 
            id="AccessControlSystems"
            className={styles.redDot_AccessControlSystemsWrapper} 
            onClick={handleLearnMoreClick_smart_BuildingTo_AccessControlSystems}
          >
            <div className={styles.tooltipText}>
              <h3>Access Control Systems</h3>
              <p>Technologies for Secure Access Management</p>
              <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_AccessControlSystems}>
                ต่อไป
              </button>
            </div>
          </div>

          <div 
            id="SurveillanceAndSecurity"
            className={styles.redDot_SurveillanceSecurityWrapper} 
            onClick={handleLearnMoreClick_smart_BuildingTo_SurveillanceandSecuritySystem}
          >
            <div className={styles.tooltipText}>
              <h3>Surveillance and Security System</h3>
              <p>AI-Enhanced Surveillance, Biometric Access Control, and Advanced Fire Detection</p>
              <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_SurveillanceandSecuritySystem}>
                ต่อไป
              </button>
            </div>
          </div>

          <div 
            id="Lighting"
            className={styles.redDot_LightingWrapper} 
            onClick={handleLearnMoreClick_smart_BuildingTo_Lighting}
          >
            <div className={styles.tooltipText}>
              <h3>Smart Lighting</h3>
              <p>Adaptive Lighting System</p>
              <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_Lighting}>
                ต่อไป
              </button>
            </div>
          </div>

          <div 
            id="BuildingAutomation"
            className={styles.redDot_BuildingAutomationWrapper} 
            onClick={handleLearnMoreClick_smart_BuildingTo_BuildingAutomationSystem}
          >
            <div className={styles.tooltipText}>
              <h3>Building Automation System</h3>
              <p>Efficient Control of HVAC, Electrical, Security, and Water Management</p>
              <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_BuildingAutomationSystem}>
                ต่อไป
              </button>
            </div>
          </div>

          <div 
            id="MotionSensors"
            className={styles.redDot_MotionSensorsWrapper} 
            onClick={handleLearnMoreClick_smart_BuildingTo_MotionSensors}
          >
            <div className={styles.tooltipText}>
              <h3>Motion Sensors</h3>
              <p>Future Trends in Motion Detection</p>
              <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_MotionSensors}>
                ต่อไป
              </button>
            </div>
          </div>

          <div 
            id="SmartParking"
            className={styles.redDot_SmartParkingWrapper} 
            onClick={handleLearnMoreClick_smart_BuildingTo_SmartParkingManagement}
          >
            <div className={styles.tooltipText}>
              <h3>Smart Parking Management</h3>
              <p>Efficient Parking Management and Availability Tracking</p>
              <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_SmartParkingManagement}>
                ต่อไป
              </button>
            </div>
          </div>

          {/* Tutorial Overlay */}
          {showTutorial && (
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
              
              <div className={`${styles.messageBox} ${
                styles[`messageBoxStep${currentStep + 1}`]
              }`}>
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
                    {currentStep < tutorialSteps.length - 1 ? 'ต่อไป' : 'เสร็จสิ้น'}
                  </button>
                </div>
              </div>
            
              <button 
                className={styles.skipButton} 
                onClick={handleSkip}
              >
                ข้าม Tutorial
              </button>
            </div>
          )}
        </div>
      </div>
     
    </section>
    <Contact />
    </>
    
  );
  
};

export default SmartSolutions_Building;