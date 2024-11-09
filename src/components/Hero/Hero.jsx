import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Hero.module.css";
import {Navbar} from "../Navbar/Navbar"; 
import { Contact } from "../Contact/Contact";
export const Hero = () => {
  const navigate = useNavigate();

  const backgroundImages = [
    "/image/banner-security.jpg", // เปลี่ยนเป็น URL ของภาพพื้นหลังของคุณ
    "/image/banner-software.jpg",
    "/image/banner-telecom.jpg",
  ];  

  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);


  const topics = [
    { name: "Smart Building;", imgSrc: "/image/smartsolution.jpg" },
    { name: "Smart Hospital", imgSrc: "/image/cloudsolution.jpg" },
    { name: "Smart Platform", imgSrc: "/image/cybersecurity.jpg" },
    { name: "Smart Learning", imgSrc: "/image/softwaredevelopment.jpg" },
    { name: "Smart Logistics", imgSrc: "/image/greensolution.jpg" },
    { name: "Smart Organized Communication Cables", imgSrc: "/image/Autonomous-System.jpg" },
    { name: "Autonomous Solution", imgSrc: "/image/Telecom-and-Network-Infrastructure.jpg" },
    { name: "Cyber Security", imgSrc: "/image/ICTInfrastructure.jpg" },
    { name: "Smart Farming", imgSrc: "/image/public-safety.jpg" },
    { name: "Smart Utility(Grid)", imgSrc: "/image/Logistics.jpg" },
    { name: "Cloud Service", imgSrc: "/image/Edutech.jpg" },
    
    
   
  ];

  const handleLearnMoreClick_smart_solutions = () => {
    navigate("/smart-solutions");
  };
  const handleLearnMoreClick_smart_building = () => {
    navigate("/smart-solutions-building_new");
  };
  const handleLearnMoreClick_smart_building_ver02 = () => {
    navigate("/smart-solutions-building_new_ver02");
  };

  const handleLearnMoreClick_smart_Utility = () => {
    navigate("/smart-solutions-utility_new");
  };
  
  
  
  const handleLearnMoreClick_green_solutions = () => {
    navigate("/green-solutions");
  };



  useEffect(() => {
    // เปลี่ยนภาพพื้นหลังทุก ๆ 5 วินาที
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval); // ทำความสะอาดเมื่อ component ถูกยกเลิก
  }, [backgroundImages.length]);
  return (
    <>
      <Navbar />
      
      

    

{/*     
<div className={styles.productShowcase}>
  <div className={styles.showcaseContent}>
    <div className={styles.imageContainer2}>
      <img src="/image/cybersecurity.jpg" alt="Automotive Dashboard" />
    </div>
    <div className={styles.textContainer}>
      <h2>Automotive Cloud</h2>
      <p>
        See your driver’s information in one place. Dive into purchase and service histories,
        check open leases and warranties, and even manage in-vehicle features and subscriptions.
        Now you can surprise and delight at every touchpoint with an AI CRM for automotive.
      </p>
      <div className={styles.buttons}>
        <a href="#learn-more" className={styles.primaryButton}>Learn more</a>
        <a href="#try-for-free" className={styles.secondaryButton}>Try for free</a>
      </div>
    </div>
  </div>
</div> */}


<div className={styles.solutionSection}  style={{
          backgroundImage: `url(${backgroundImages[currentBackgroundIndex]})`,
          transition: "background-image 1s ease-in-out", // เอฟเฟกต์เฟด
        }}
      >
  
{/* <h2 className={styles.sectionTitle}>Smart Solution</h2> */}
<div className={styles.imageContainer_icon}>
  <img
    src="/image/icon_smart_solution.png"
    alt="Smart Solution"
    className={styles.aboutImage}
  />
</div>

  <div className={styles.threeColumnSolutions}>
    
  <div
  className={styles.solutionCard}
  onClick={handleLearnMoreClick_smart_building} // ทำให้ทั้งการ์ดเป็นปุ่มที่คลิกได้
  role="button" // เพิ่ม role เพื่อบ่งบอกว่าเป็นปุ่ม
  tabIndex="0" // ทำให้สามารถโฟกัสได้โดยการกด Tab บนคีย์บอร์ด
  onKeyDown={(e) => e.key === 'Enter' && handleLearnMoreClick_smart_building()} // รองรับการกด Enter เพื่อคลิก
   >
      
      <img src="/image/smartsolution2.png" className={styles.solutionImage} />
      <h3>Smart Building</h3>
     
           
          {/* Red Dots with Enhanced Tooltips */}
      
      <p></p>
      
    </div>

    <div className={styles.solutionCard}>
      <img src="/image/Smart Hospital.jpg"  className={styles.solutionImage} />
      <h3>Smart Hospital</h3>
      <p></p>
      
    </div>

    <div className={styles.solutionCard}>
      <img src="/image/Samrt Platform.jpg"  className={styles.solutionImage} />
      <h3>Smart Platform</h3>
      <p></p> 
    </div>
    
    <div className={styles.solutionCard}>
    <img src="/image/Smart Learning.jpg"  className={styles.solutionImage} />
    <h3>Smart Learning</h3>
    <p></p>
    
  </div>
    
  </div>


  <div className={styles.threeColumnSolutions}>
  
  <div
  className={styles.solutionCard}
  onClick={handleLearnMoreClick_green_solutions} // ทำให้ทั้งการ์ดเป็นปุ่มที่คลิกได้
  role="button" // เพิ่ม role เพื่อบ่งบอกว่าเป็นปุ่ม
  tabIndex="0" // ทำให้สามารถโฟกัสได้โดยการกด Tab บนคีย์บอร์ด
  onKeyDown={(e) => e.key === 'Enter' && handleLearnMoreClick_green_solutions()} // รองรับการกด Enter เพื่อคลิก
   >
    <img src="/image/Smart Logistics.jpg"  className={styles.solutionImage} />
    <h3>Smart Logistics</h3>
    <p></p>
   
  </div>
  <div className={styles.solutionCard}>
    <img src="/image/SmartSolutions_Organized_Communication_Cables.jpg" className={styles.solutionImage} />
    <h3>SmartOrganized CommunicationCables</h3>
    <p></p>
    
  </div>
  <div className={styles.solutionCard}>
    <img src="/image/Autonomous Solution.jpg"  className={styles.solutionImage} />
    <h3>Autonomous Solution</h3>
    <p></p>
   
  </div>
  
  <div className={styles.solutionCard}>
    <img src="/image/Cyber Security.jpg"  className={styles.solutionImage} />
    <h3>Cyber Security</h3>
    <p></p>
    
  </div>
  
   </div>

   
   <div className={styles.threeColumnSolutions}>
   <div className={styles.solutionCard}>
    <img src="/image/Smart Farming.jpg" className={styles.solutionImage} />
    <h3>Smart Farming</h3>
    <p></p>
   
  </div>
   <div
  className={styles.solutionCard}
  onClick={handleLearnMoreClick_smart_Utility} // ทำให้ทั้งการ์ดเป็นปุ่มที่คลิกได้
  role="button" // เพิ่ม role เพื่อบ่งบอกว่าเป็นปุ่ม
  tabIndex="0" // ทำให้สามารถโฟกัสได้โดยการกด Tab บนคีย์บอร์ด
  onKeyDown={(e) => e.key === 'Enter' && handleLearnMoreClick_smart_Utility()} // รองรับการกด Enter เพื่อคลิก
  
   >
    
    <img src="/image/Smart Utility (Grid).jpg"  className={styles.solutionImage} />
    <h3>Smart Utility(Grid)</h3>
    <p></p>
    
  </div>
  
  <div className={styles.solutionCard}>
    <img src="/image/Cloud Services.jpg"  className={styles.solutionImage} />
    <h3>Cloud Service</h3>
    <p></p>
    
  </div>
 
  
   </div>
</div>


      <Contact />
    </>
  );
};
  