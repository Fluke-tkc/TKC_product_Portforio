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
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  
  // ข้อมูลรูปภาพทั้งหมด
  const allImages = [
    {
      id: 'Demand Response(DR)Energy Management System(EMS)',
      src: "/image/U_3.png",
      title: "Demand Response(DR)Energy Management System(EMS)",
      description: "Sustainable energy solutions for smart buildings"
    },
    {
      id: 'Renewable Energy',
      src: "/image/U_4.png",
      title: "Renewable Energy",
      description: "Connected devices and smart sensors"
    },
    {
      id: 'Advanced Mtering Infrastructure(AMI)',
      src: "/image/U_5.png",
      title: "Advanced Mtering Infrastructure(AMI)",
      description: "Advanced security access management"
    },
    {
      id: 'Microgrid Prosumer',
      src: "/image/U_6.png",
      title: "Microgrid Prosumer",
      description: "Comprehensive building security"
    },
    {
      id: 'EV Integration',
      src: "/image/U_7.png",
      title: "EV Integration",
      description: "Intelligent lighting control"
    },
    {
      id: 'EnergyStorageSysem',
      src: "/image/U_8.png",
      title: "EnergyStorageSysem",
      description: "Automated building management"
    }
    
  ];

  // คอมโพเนนต์สำหรับจัดการจุดสีแดงในแต่ละรูปภาพ
  const DynamicRedDots = ({ currentImage }) => {
    const [activeTooltip, setActiveTooltip] = useState(null);

    // กำหนดตำแหน่งและข้อความสำหรับจุดแต่ละจุดในแต่ละรูปภาพ
    const dotConfigurations = {
      'renewableEnergy': [
        {
          // id: 'solar-panels',
          className: styles.redDot_RenewableEnergyIntegrationWrapper,
        //   tooltip: 'แผงโซลาร์เซลล์',
          // description: 'ระบบผลิตพลังงานแสงอาทิตย์สำหรับอาคาร',
          position: { top: '11%', left: '59%' }
        },
        {
          id: 'energy-storage',
          className: styles.redDot_EnergyStorageWrapper,
          // tooltip: 'ระบบกักเก็บพลังงาน',
          // description: 'แบตเตอรี่สำหรับเก็บพลังงานไว้ใช้ในเวลากลางคืน',
          position: { top: '45%', left: '90%' }
        }
      ],
      'iot': [
        {
          id: 'iot-sensors',
          className: styles.redDot_IotWrapper,
          // tooltip: 'เซ็นเซอร์ IoT',
          // description: 'ตรวจวัดสภาพแวดล้อมภายในอาคาร',
          position: { top: '25%', left: '86%' }
        },
        {
          id: 'data-hub',
          className: styles.redDot_DataHubWrapper,
          // tooltip: 'ศูนย์ข้อมูล',
          // description: 'ประมวลผลและจัดเก็บข้อมูลจากเซ็นเซอร์',
          position: { top: '50%', left: '65%' }
        }
      ],
      
      'Access Control Systems': [
        {
          id: 'access-control',
          className: styles.redDot_AccessControlSystemsWrapper,
          // tooltip: 'ระบบควบคุมการเข้าออก',
          // description: 'เทคโนโลยีการควบคุมการเข้าถึงที่ปลอดภัย',
          position: { top: '8%', left: '65.5%' }
        }
      ],
      'Security System': [
        {
          id: 'security-system',
          className: styles.redDot_SurveillanceSecurityWrapper,
          // tooltip: 'ระบบรักษาความปลอดภัย',
          // description: 'กล้องวงจรปิดและระบบเฝ้าระวัง',
          position: { top: '21%', left: '94%' }
        }
      ],
      'Smart Lighting': [
        {
          id: 'smart-lighting',
          className: styles.redDot_LightingWrapper,
          // tooltip: 'ระบบไฟอัจฉริยะ',
          // description: 'ระบบควบคุมแสงสว่างอัตโนมัติ',
          position: { top: '4%', left: '68.5%' }
        }
      ],
      'Building Automation System': [
        {
          id: 'building-automation',
          className: styles.redDot_BuildingAutomationWrapper,
          // tooltip: 'ระบบอาคารอัตโนมัติ',
          // description: 'ควบคุมระบบอาคารอัตโนมัติทั้งหมด',
          position: { top: '92%', left: '19%' }
        }
      ],
     
    };

    const dots = dotConfigurations[currentImage] || [];

    return (
      <>
        {dots.map((dot) => (
          <div
            key={dot.id}
            className={dot.className}
            style={dot.position}
            //  onMouseEnter={() => setActiveTooltip(dot.id)}
            // onMouseLeave={() => setActiveTooltip(null)}
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

  // ฟังก์ชันจัดการการนำทาง
  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setShowImageViewer(false);
  };

  const handleCloseViewer = () => {
    setShowImageViewer(false);
  };

  const handleSectionClick = (sectionId) => {
    const index = allImages.findIndex(img => img.id === sectionId);
    if (index !== -1) {
      setCurrentImageIndex(index);
      setShowImageViewer(true);
    }
  };
  const handleMouseEnterWithDelay = (section) => {
    // ยกเลิก timeout เดิมถ้ามี
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // ตั้ง timeout ใหม่
    timeoutRef.current = setTimeout(() => {
      handleSectionClick(section);
    }, 3000);
  };

  // ฟังก์ชันจัดการเมื่อเมาส์ออก
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
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
  // แสดงผลส่วนหลัก
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

            {/* Red Dots */}
            <div
                   id="RenewableEnergy"
                   className={styles.redDot_RenewableEnergyIntegrationWrapper}
                   onMouseEnter={() => handleMouseEnterWithDelay("Demand Response(DR)Energy Management System(EMS)")}
                   onMouseLeave={handleMouseLeave}
                   onClick={() => handleSectionClick("Demand Response(DR)Energy Management System(EMS)")} // เพิ่ม onClick กลับมา
                 
               />
 
            <div 
              id="Iot"
              className={styles.redDot_IotWrapper}
               onClick={() => handleSectionClick('Renewable Energy')}
               onMouseEnter={() => handleMouseEnterWithDelay("Renewable Energy")}
               onMouseLeave={handleMouseLeave}
             // onMouseEnter={() => handleSectionClick('iot')}
            />
            <div 
              id="Access Control Systems"
              className={styles.redDot_AccessControlSystemsWrapper}
               onClick={() => handleSectionClick('Advanced Mtering Infrastructure(AMI)')}
               onMouseEnter={() => handleMouseEnterWithDelay("Advanced Mtering Infrastructure(AMI)")}
               onMouseLeave={handleMouseLeave}
            //  onMouseEnter={() => handleSectionClick('Access Control Systems')}
            />
            <div 
              id="Security System"
              className={styles.redDot_SurveillanceSecurityWrapper}
               onClick={() => handleSectionClick('Microgrid Prosumer')}
               onMouseEnter={() => handleMouseEnterWithDelay("Microgrid Prosumer")}
               onMouseLeave={handleMouseLeave}
            //  onMouseEnter={() => handleSectionClick('Security System')}
            />
             <div 
              id="Smart Lighting"
              className={styles.redDot_LightingWrapper}
               onClick={() => handleSectionClick('EV Integration')}
               onMouseEnter={() => handleMouseEnterWithDelay("EV Integration")}
               onMouseLeave={handleMouseLeave}
            //  onMouseEnter={() => handleSectionClick('Smart Lighting')}
            />
             <div 
              id="Building Automation System"
              className={styles.redDot_BuildingAutomationWrapper}
               onClick={() => handleSectionClick('EnergyStorageSysem')}
               onMouseEnter={() => handleMouseEnterWithDelay("EnergyStorageSysem")}
               onMouseLeave={handleMouseLeave}
             // onMouseEnter={() => handleSectionClick('Building Automation System')}
            />
             
           
           
           

            {/* Image Viewer Overlay */}
            {showImageViewer && (
              <div className={styles.imageViewerOverlay}>
                <div className={styles.viewerContent}>
                  <img
                    src={allImages[currentImageIndex].src}
                    alt={allImages[currentImageIndex].title}
                    className={styles.viewerImage}
                  />
                  <DynamicRedDots currentImage={allImages[currentImageIndex].id} />
                  <div className={styles.navigationButtons}>
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
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default SmartSolutions_Utility_New_ver02;