import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Hero.module.css";
import {Navbar} from "../Navbar/Navbar"; 
import { Contact } from "../Contact/Contact";
export const Hero = () => {
  const navigate = useNavigate();

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

  const handleLearnMoreClick_smart_Utility = () => {
    navigate("/smart-solutions-utility_new");
  };
  
  
  
  const handleLearnMoreClick_green_solutions = () => {
    navigate("/green-solutions");
  };
  return (
    <>
      <Navbar />
      <div className={styles.BG1}>
        <div className={styles.topic1}>บริษัท เทิร์นคีย์ คอมมูนิเคชั่น เซอร์วิส จำกัด (มหาชน)</div>
        {/* <div className={styles.topic1}>company in your industry.</div> */}
        <div className={styles.topic2}>มีความยินดีเป็นอย่างยิ่งที่จะนำเสนอผลงานและบริการที่เราได้พัฒนาขึ้นเพื่อสนับสนุนความสำเร็จของลูกค้าและพันธมิตรทางธุรกิจ 
                                       เรามุ่งมั่นในการนำเสนอโซลูชันที่ครบวงจรและตอบโจทย์การสื่อสารในยุคดิจิทัล ทั้งในด้านเทคโนโลยีการเชื่อมต่อ 
                                       และการให้บริการด้วยมาตรฐานระดับสากล
        </div>
        <div className={styles.topic2}>ในทุกขั้นตอนของการทำงาน เราให้ความสำคัญกับนวัตกรรม คุณภาพ และความเชื่อมั่นที่ลูกค้าสามารถไว้วางใจได้ 
        ด้วยทีมงานที่มีความเชี่ยวชาญและประสบการณ์ยาวนาน 
        เรามุ่งสู่การเป็นผู้นำด้านการสื่อสารและไอซีทีครบวงจร เพื่อเสริมสร้างความแข็งแกร่งให้กับระบบโครงสร้างพื้นฐานการสื่อสารและไอซีทีของประเทศ
        เราหวังว่าผลงานที่นำเสนอในครั้งนี้ จะเป็นส่วนหนึ่งในการสร้างความมั่นใจ และส่งเสริมการพัฒนาทางธุรกิจร่วมกันต่อไป</div>

        
        {/* <div className={styles.buttonContainer}>
    <a  className={styles.primaryButtonTop}>Learn more</a>
  </div> */}
      </div>
      

    

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


<div className={styles.solutionSection}>
  
  <h2 className={styles.sectionTitle}>Smart Solution</h2>
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
      <br/>
      <p>แนวทางหรือระบบที่ใช้เทคโนโลยีขั้นสูงและนวัตกรรมในการแก้ปัญหาหรือปรับปรุงกระบวนการต่างๆ เพื่อเพิ่มประสิทธิภาพ
         ความสะดวกสบาย และประสบการณ์การใช้งาน โดยมุ่งเน้นการเชื่อมโยงข้อมูลและการทำงานร่วมกันระหว่างอุปกรณ์หรือระบบที่แตกต่างกัน</p>
      <div className={styles.buttonContainerOurservice}>
      {/* <a href="#learn-more" className={styles.primaryButtonTop}onClick={handleLearnMoreClick_smart_solutions} >Learn more</a> */}
        
      </div>
    </div>

    <div className={styles.solutionCard}>
      <img src="/image/cloudsolution.jpg"  className={styles.solutionImage} />
      <h3>Smart Hospital</h3>
      <p>Protect your infrastructure with the latest in cybersecurity technology, ensuring your data stays safe.</p>
      <div className={styles.buttonContainerOurservice}>
        {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
      </div>
    </div>

    <div className={styles.solutionCard}>
      <img src="/image/cybersecurity.jpg"  className={styles.solutionImage} />
      <h3>Smart Platform</h3>
      <p>Transform your business with cloud solutions tailored to your unique needs.</p>
      <div className={styles.buttonContainerOurservice}>
        {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
      </div>
    </div>
  </div>


  <div className={styles.threeColumnSolutions}>
  <div className={styles.solutionCard}>
    <img src="/image/softwaredevelopment.jpg"  className={styles.solutionImage} />
    <h3>Smart Learning</h3>
    <p>Unleash the power of artificial intelligence to make sense of your data and drive decision-making.</p>
    <div className={styles.buttonContainerOurservice}>
    {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
    </div>
  </div>
  
  <div
  className={styles.solutionCard}
  onClick={handleLearnMoreClick_green_solutions} // ทำให้ทั้งการ์ดเป็นปุ่มที่คลิกได้
  role="button" // เพิ่ม role เพื่อบ่งบอกว่าเป็นปุ่ม
  tabIndex="0" // ทำให้สามารถโฟกัสได้โดยการกด Tab บนคีย์บอร์ด
  onKeyDown={(e) => e.key === 'Enter' && handleLearnMoreClick_green_solutions()} // รองรับการกด Enter เพื่อคลิก
   >
    <img src="/image/greensolution.png"  className={styles.solutionImage} />
    <h3>Smart Logistics</h3>
    <p>Protect your infrastructure with the latest in cybersecurity technology, ensuring your data stays safe.</p>
    <div className={styles.buttonContainerOurservice}>
    {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
    </div>
  </div>
  <div className={styles.solutionCard}>
    <img src="/image/Autonomous-System.jpg" className={styles.solutionImage} />
    <h3>Smart Organized Communication Cables</h3>
    <p>Transform your business with cloud solutions tailored to your unique needs.</p>
    <div className={styles.buttonContainerOurservice}>
    {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
    </div>
  </div>
  
   </div>

   <div className={styles.threeColumnSolutions}>
  <div className={styles.solutionCard}>
    <img src="/image/Telecom-and-Network-Infrastructure.jpg"  className={styles.solutionImage} />
    <h3>Autonomous Solution</h3>
    <p>Unleash the power of artificial intelligence to make sense of your data and drive decision-making.</p>
    <div className={styles.buttonContainerOurservice}>
    {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
    </div>
  </div>
  
  <div className={styles.solutionCard}>
    <img src="/image/ICTInfrastructure.jpg"  className={styles.solutionImage} />
    <h3>Cyber Security</h3>
    <p>Protect your infrastructure with the latest in cybersecurity technology, ensuring your data stays safe.</p>
    <div className={styles.buttonContainerOurservice}>
    {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
    </div>
  </div>
  <div className={styles.solutionCard}>
    <img src="/image/public-safety.jpg" className={styles.solutionImage} />
    <h3>Smart Farming</h3>
    <p>Transform your business with cloud solutions tailored to your unique needs.</p>
    <div className={styles.buttonContainerOurservice}>
    {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
    </div>
  </div>
  
   </div>
   <div className={styles.threeColumnSolutions}>
   <div
  className={styles.solutionCard}
  onClick={handleLearnMoreClick_smart_Utility} // ทำให้ทั้งการ์ดเป็นปุ่มที่คลิกได้
  role="button" // เพิ่ม role เพื่อบ่งบอกว่าเป็นปุ่ม
  tabIndex="0" // ทำให้สามารถโฟกัสได้โดยการกด Tab บนคีย์บอร์ด
  onKeyDown={(e) => e.key === 'Enter' && handleLearnMoreClick_smart_Utility()} // รองรับการกด Enter เพื่อคลิก
   >
    <img src="/image/Logistics.jpg"  className={styles.solutionImage} />
    <h3>Smart Utility(Grid)</h3>
    <p>Unleash the power of artificial intelligence to make sense of your data and drive decision-making.</p>
    <div className={styles.buttonContainerOurservice}>
    {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
    </div>
  </div>
  
  <div className={styles.solutionCard}>
    <img src="/image/Edutech.jpg"  className={styles.solutionImage} />
    <h3>Cloud Service</h3>
    <p>Protect your infrastructure with the latest in cybersecurity technology, ensuring your data stays safe.</p>
    <div className={styles.buttonContainerOurservice}>
    {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
    </div>
  </div>
 
  
   </div>
</div>


      <Contact />
    </>
  );
};
  