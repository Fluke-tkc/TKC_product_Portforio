import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SmartBuildingTutorial.module.css';

const SmartBuildingTutorial = () => {

  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const tutorialSteps = [
    {
      target: '.redDot_RenewableEnergyIntegrationWrapper',
      title: 'พลังงานหมุนเวียน',
      content: 'ค้นพบวิธีการผสานพลังงานหมุนเวียนเข้ากับระบบอาคาร',
      spotlightClass: styles.spotlightStep1,
      messageBoxClass: styles.messageBoxStep1
    },
    {
      target: '.redDot_LightingWrapper',
      title: 'ระบบแสงสว่างอัจฉริยะ',
      content: 'เรียนรู้เกี่ยวกับระบบแสงสว่างอัจฉริยะที่ช่วยประหยัดพลังงาน',
      spotlightClass: styles.spotlightStep2,
      messageBoxClass: styles.messageBoxStep2
    }
  ];

  const handleClick = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handleSkip = () => {
    setShowTutorial(false);
  };

  return (
    <div className={styles.tutorialContainer}>
      {showTutorial && (
        <>
          <div className={styles.overlay} />
          
          <div className={`${styles.spotlight} ${tutorialSteps[currentStep].spotlightClass}`} />
          
          <div className={`${styles.messageBox} ${tutorialSteps[currentStep].messageBoxClass}`}>
            <h3 className={styles.messageTitle}>{tutorialSteps[currentStep].title}</h3>
            <p className={styles.messageContent}>{tutorialSteps[currentStep].content}</p>
            <p className={styles.continueText}>คลิกที่ใดก็ได้เพื่อไปขั้นตอนถัดไป</p>
          </div>

          <button className={styles.skipButton} onClick={handleSkip}>
            ข้าม Tutorial
          </button>
          
          <div className={styles.clickableArea} onClick={handleClick} />
        </>
      )}
      
      {/* Red Dots */}
      <div className={`${styles.redDot} ${styles.redDotHighlight}`} />
    </div>
  );
};

export default SmartBuildingTutorial;