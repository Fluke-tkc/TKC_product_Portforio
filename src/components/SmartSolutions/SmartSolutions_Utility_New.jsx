import React, { useState, useEffect } from "react";
import styles from "./SmartSolutions_Utility_New.module.css";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";
import { useLanguage } from "../../contexts/LanguageContext";
export const SmartSolutions_Utility_New = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const { images } = useLanguage();

  const tutorialSteps = [
    {
      target: 'Demand Response(DR)',
      title: 'Demand Response(DR)',
      content: 'Optimizes energy use by reducing consumption during peak times, easing grid load and cutting costs ',

    },
    {
      target: 'Energy Management System(EMS)',
      title: 'Energy Management System(EMS)',
      content: 'Optimizes energy use with real-time data, improving efficiency and cutting costs.​'
    },
    {
      target: 'Renewable Energy​',
      title: 'Renewable Energy​',
      content: 'Integrating renewable energy into the grid enhances clean energy share​​'
    },
    {
      target: 'Advanced Metering Infrastructure (AMI)​​',
      title: 'Advanced Metering Infrastructure (AMI)​​',
      content: 'Technology deploying smart meters that seamlessly relay real-time energy usage between consumers and providers​.​​​'
    },
    {
      target: 'Microgrid & Prosumer​',
      title: 'Microgrid & Prosumer​',
      content: 'Efficient Local Energy Management and independently from the main grid.​​'
    },
    {
      target: 'EV Integration​​',
      title: 'EV Integration​​',
      content: 'Elegantly connects electric vehicles to the grid​​'
    },
    {
      target: 'Energy Storage System​',
      title: 'Energy Storage System​',
      content: 'Ensuring Stable Electricity Supply.​'
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
  const handleClosePostTutorialImage = () => {
    // setShowPostTutorialImage(false);
    navigate("/smart-solutions-utility_new_ver02");
  };
  const handleLearnMoreClick_smart_BuildingTo_DemandResponse = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'DemandResponse' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_EnergyManagementSystem = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'EnergyManagementSystem' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_RenewableEnergy = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Renewable Energy​' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_AdvancedMeteringInfrastructure = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Advanced Metering Infrastructure (AMI)' } });
    
  };
  const handleLearnMoreClick_smart_BuildingTo_MicrogridProsumer = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Microgrid & Prosumer​' } });
  };
  const handleLearnMoreClick_smart_BuildingTo_EVIntegration = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'EV Integration' } });
  };

  const handleLearnMoreClick_smart_BuildingTo_EnergyStorageSystem = () => {
    navigate("/smart-solutions-building", { state: { scrollTo: 'Energy Storage System​' } });
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        navigate("/");
      }
    };

    // เพิ่ม event listener สำหรับ keydown
    document.addEventListener('keydown', handleKeyDown);

    // ลบ event listener เมื่อ component ถูก unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]
  )

  return (
    <>
     <Navbar />
    <section className={styles.container} id="about">
      
      <div className={styles.content}>
        <div className={styles.imageContainer}>
        {/* <div className={styles.overlayText}>Intelligent Grid</div>
        <div className={styles.overlayText_1}>Technology-driven system that optimizes energy management through sensors, data analytics, and smart communication​</div> */}
          <img
            src={images.smart_solutions_utility_new_00}
            alt="Smart Building"
            className={styles.aboutImage}
            onClick={handleClosePostTutorialImage}
          />
           
       
          {/* Red Dots with Enhanced Tooltips */}
          <div 
            id="DemandResponse"
            className={styles.redDot_DemandResponseWrapper} 
            // onClick={handleLearnMoreClick_smart_BuildingTo_DemandResponse}handleClosePostTutorialImage
            onClick={handleClosePostTutorialImage}
          >
            
            <div className={styles.tooltipText}>
              
              <h3>Demand Response(DR)</h3>
              <p>Optimizes energy use by reducing consumption during peak times, easing grid load and cutting costs</p>
              {/* <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_DemandResponse}>
                ต่อไป
              </button> */}
              
            </div>
          </div>

          <div 
            id="Energy Management System(EMS)"
            className={styles.redDot_EnergyManagementSystemWrapper} 
            // onClick={handleLearnMoreClick_smart_BuildingTo_EnergyManagementSystem}
            onClick={handleClosePostTutorialImage}
          >
            <div className={styles.tooltipText}>
              <h3>Energy Management System(EMS)</h3>
              <p>Optimizes energy use with real-time data, improving efficiency and cutting costs.</p>
              {/* <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_EnergyManagementSystem}>
                ต่อไป
              </button> */}
            </div>
          </div>

          <div 
            id="Renewable Energy​"
            className={styles.redDot_RenewableEnergyWrapper} 
            // onClick={handleLearnMoreClick_smart_BuildingTo_RenewableEnergy}
            onClick={handleClosePostTutorialImage}
          >
            <div className={styles.tooltipText}>
              <h3>Renewable Energy</h3>
              <p>Integrating renewable energy into the grid enhances clean energy share</p>
              {/* <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_RenewableEnergy}>
                ต่อไป
              </button> */}
            </div>
          </div>

          <div 
            id="Advanced Metering Infrastructure (AMI)"
            className={styles.redDot_AdvancedMeteringInfrastructureWrapper} 
            // onClick={handleLearnMoreClick_smart_BuildingTo_AdvancedMeteringInfrastructure}
            onClick={handleClosePostTutorialImage}
          >
            <div className={styles.tooltipText}>
              <h3>Advanced Metering Infrastructure (AMI)</h3>
              <p>Technology deploying smart meters that seamlessly relay real-time energy usage between consumers and providers.</p>
              {/* <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_AdvancedMeteringInfrastructure}>
                ต่อไป
              </button> */}
            </div>
          </div>

          <div 
            id="Microgrid & Prosumer​"
            className={styles.redDot_MicrogridProsumerWrapper} 
            // onClick={handleLearnMoreClick_smart_BuildingTo_MicrogridProsumer}
            onClick={handleClosePostTutorialImage}
          >
            <div className={styles.tooltipText}>
              <h3>Microgrid & Prosumer</h3>
              <p>Efficient Local Energy Management and independently from the main grid</p>
              {/* <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_MicrogridProsumer}>
                ต่อไป
              </button> */}
            </div>
          </div>
          <div 
            id="EV Integration"
            className={styles.redDot_EVIntegrationWrapper} 
            // onClick={handleLearnMoreClick_smart_BuildingTo_EVIntegration}
            onClick={handleClosePostTutorialImage}
          >
            <div className={styles.tooltipText}>
              <h3>EV Integration</h3>
              <p>Elegantly connects electric vehicles to the grid</p>
              {/* <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_EVIntegration}>
                ต่อไป
              </button> */}
            </div>
          </div>

          <div 
            id="Energy Storage System"
            className={styles.redDot_EnergyStorageSystemWrapper} 
            // onClick={handleLearnMoreClick_smart_BuildingTo_EnergyStorageSystem}
            onClick={handleClosePostTutorialImage}
          >
            <div className={styles.tooltipText}>
              <h3>Energy Storage System</h3>
              <p>Ensuring Stable Electricity Supply.</p>
              {/* <button className={styles.tooltipButton} onClick={handleLearnMoreClick_smart_BuildingTo_EnergyStorageSystem}>
                ต่อไป
              </button> */}
            </div>
          </div>

        

          

          

          {/* Tutorial Overlay */}
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
          )} */}
        </div>
      </div>
     
    </section>
    <Contact />
    </>
    
  );
  
};

export default SmartSolutions_Utility_New;