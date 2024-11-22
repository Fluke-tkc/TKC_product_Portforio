import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";
import styles from "./SmartSolutions_Hospital_New_ver02.module.css";

export const SmartSolutions_Hospital_New_ver02 = () => {
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
      id: 'renewableEnergy',
      src: "/image/H_1.png",
      title: "Renewable Energy Integration",
      description: "Sustainable energy solutions for smart buildings"
    },
    {
      id: 'iot',
      src: "/image/H_2.png",
      title: "IoT Systems",
      description: "Connected devices and smart sensors"
    },
    {
      id: 'Access Control Systems',
      src: "/image/H_3.png",
      title: "Access Control",
      description: "Advanced security access management"
    },
    {
      id: 'Security System',
      src: "/image/H_4.png",
      title: "Security Systems",
      description: "Comprehensive building security"
    },
    {
      id: 'Smart Lighting',
      src: "/image/H_5.png",
      title: "Smart Lighting",
      description: "Intelligent lighting control"
    },
    // {
    //   id: 'Building Automation System',
    //   src: "/image/H_6.png",
    //   title: "Building Automation",
    //   description: "Automated building management"
    // },
    // {
    //   id: 'Motion Sensors',
    //   src: "/image/P_7.png",
    //   title: "Motion Detection",
    //   description: "Advanced motion sensing technology"
    // },
    // {
    //   id: 'Smart Parking Management',
    //   src: "/image/P_8.png",
    //   title: "Smart Parking",
    //   description: "Intelligent parking solutions"
    // }
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
          position: { top: '25%', left: '18%' }
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
          position: { top: '50%', left: '10%' }
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
          position: { top: '80%', left: '44%' }
        }
      ],
      'Security System': [
        {
          id: 'security-system',
          className: styles.redDot_SurveillanceSecurityWrapper,
          // tooltip: 'ระบบรักษาความปลอดภัย',
          // description: 'กล้องวงจรปิดและระบบเฝ้าระวัง',
          position: { top: '26%', left: '72%' }
        }
      ],
      'Smart Lighting': [
        {
          id: 'smart-lighting',
          className: styles.redDot_LightingWrapper,
          // tooltip: 'ระบบไฟอัจฉริยะ',
          // description: 'ระบบควบคุมแสงสว่างอัตโนมัติ',
          position: { top: '36%', left: '63.5%' }
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
      'Motion Sensors': [
        {
          id: 'motion-sensors',
          className: styles.redDot_MotionSensorsWrapper,
          // tooltip: 'เซ็นเซอร์ตรวจจับการเคลื่อนไหว',
          // description: 'ระบบตรวจจับการเคลื่อนไหวอัจฉริยะ',
          position: { top: '16%', left: '96.5%' }
        }
      ],
      'Smart Parking Management': [
        {
          id: 'smart-parking',
          className: styles.redDot_SmartParkingWrapper,
          // tooltip: 'ระบบจอดรถอัจฉริยะ',
          // description: 'ระบบบริหารจัดการที่จอดรถอัตโนมัติ',
          position: { top: '85%', left: '88%' }
        }
      ]
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
        if (showImageViewer) {
          // กรณีกำลังดูรูปภาพ ให้ปิด viewer และกลับไปหน้า ver02
          setShowImageViewer(false);
          navigate("/smart-solutions-hospital_new_ver02");
        } else {
          // กรณีอยู่หน้าหลัก ให้กลับไปหน้า new
          navigate("/smart-solutions-hospital_new");
        }
      }
    };
  
    // เพิ่ม event listener สำหรับ keydown
    document.addEventListener('keydown', handleKeyDown);
  
    // ลบ event listener เมื่อ component ถูก unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, showImageViewer]); // เพิ่ม showImageViewer เป็น dependency
  // แสดงผลส่วนหลัก
  return (
    <>
      <Navbar />
      <section className={styles.container}>
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <img
              src="/image/SmartHospital_2.png"
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
                   onMouseEnter={() => handleMouseEnterWithDelay("renewableEnergy")}
                   onMouseLeave={handleMouseLeave}
                   onClick={() => handleSectionClick("renewableEnergy")} // เพิ่ม onClick กลับมา
                 
               />
 
            <div 
              id="Iot"
              className={styles.redDot_IotWrapper}
               onClick={() => handleSectionClick('iot')}
               onMouseEnter={() => handleMouseEnterWithDelay("iot")}
               onMouseLeave={handleMouseLeave}
             // onMouseEnter={() => handleSectionClick('iot')}
            />
            <div 
              id="Access Control Systems"
              className={styles.redDot_AccessControlSystemsWrapper}
               onClick={() => handleSectionClick('Access Control Systems')}
               onMouseEnter={() => handleMouseEnterWithDelay("Access Control Systems")}
               onMouseLeave={handleMouseLeave}
            //  onMouseEnter={() => handleSectionClick('Access Control Systems')}
            />
            <div 
              id="Security System"
              className={styles.redDot_SurveillanceSecurityWrapper}
               onClick={() => handleSectionClick('Security System')}
               onMouseEnter={() => handleMouseEnterWithDelay("Security System")}
               onMouseLeave={handleMouseLeave}
            //  onMouseEnter={() => handleSectionClick('Security System')}
            />
             <div 
              id="Smart Lighting"
              className={styles.redDot_LightingWrapper}
               onClick={() => handleSectionClick('Smart Lighting')}
               onMouseEnter={() => handleMouseEnterWithDelay("Smart Lighting")}
               onMouseLeave={handleMouseLeave}
            //  onMouseEnter={() => handleSectionClick('Smart Lighting')}
            />
             {/* <div 
              id="Building Automation System"
              className={styles.redDot_BuildingAutomationWrapper}
               onClick={() => handleSectionClick('Building Automation System')}
               onMouseEnter={() => handleMouseEnterWithDelay("Building Automation System")}
               onMouseLeave={handleMouseLeave}
             // onMouseEnter={() => handleSectionClick('Building Automation System')}
            />
                 <div 
              id="Motion Sensors"
              className={styles.redDot_MotionSensorsWrapper}
               onClick={() => handleSectionClick('Motion Sensors')}
               onMouseEnter={() => handleMouseEnterWithDelay("Motion Sensors")}
               onMouseLeave={handleMouseLeave}
           //   onMouseEnter={() => handleSectionClick('Motion Sensors')}
            />
                <div 
              id="Smart Parking Management"
              className={styles.redDot_SmartParkingWrapper}
               onClick={() => handleSectionClick('Smart Parking Management')}
               onMouseEnter={() => handleMouseEnterWithDelay("Smart Parking Management")}
               onMouseLeave={handleMouseLeave}
            //  onMouseEnter={() => handleSectionClick('Smart Parking Management')}
            /> */}
           
           
           
           

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
      <Contact />
    </>
  );
};

export default SmartSolutions_Hospital_New_ver02;