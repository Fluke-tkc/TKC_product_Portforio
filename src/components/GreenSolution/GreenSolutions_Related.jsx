import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./GreenSolutions_Related.module.css";
import {Navbar} from "../Navbar/Navbar"; 
import { Contact } from "../Contact/Contact";
export const GreenSolutions_Related = () => {
  const navigate = useNavigate();



  const handleLearnMoreClick_smart_solutions = () => {
    navigate("/smartgreen-solutions-solarfarm");
  };
  
  const handleLearnMoreClick_green_solutions = () => {
    navigate("/green-solutions");
  };
  return (
    <>



<div className={styles.solutionSection}>
  
  <h2 className={styles.sectionTitle}>Related Solution</h2>
  <div className={styles.threeColumnSolutions}>
    
  <div
  className={styles.solutionCard}
  onClick={handleLearnMoreClick_smart_solutions} // ทำให้ทั้งการ์ดเป็นปุ่มที่คลิกได้
  role="button" // เพิ่ม role เพื่อบ่งบอกว่าเป็นปุ่ม
  tabIndex="0" // ทำให้สามารถโฟกัสได้โดยการกด Tab บนคีย์บอร์ด
  onKeyDown={(e) => e.key === 'Enter' && handleLearnMoreClick_smart_solutions()} // รองรับการกด Enter เพื่อคลิก
   >
      
      <img src="/image/SolarFarm.png" className={styles.solutionImage} />
      <h3>Solar Farm</h3>
      <br/>
      <p>    ฟาร์มพลังงานแสงอาทิตย์ คือพื้นที่ที่มีการติดตั้งแผงโซลาร์เซลล์จำนวนมากเพื่อผลิตพลังงานไฟฟ้าจากแสงอาทิตย์ ฟาร์มเหล่านี้มักตั้งอยู่ในพื้นที่กว้างขวาง 
        เช่น บนพื้นดินหรือหลังคาของอาคารขนาดใหญ่ และสามารถผลิตพลังงานได้ในระดับที่สูงเพียงพอที่จะจัดหาพลังงานให้กับชุมชนหรือเมือง Solar Farm 
        เป็นโซลูชันที่สำคัญในการผลิตพลังงานสะอาดและช่วยตอบโจทย์การพัฒนาที่ยั่งยืนและการเปลี่ยนแปลงสภาพภูมิอากาศในปัจจุบัน 
        โดยเฉพาะเมื่อการใช้พลังงานทดแทนได้รับการสนับสนุนมากขึ้นทั่วโลก​</p>
      <div className={styles.buttonContainerOurservice}>
      {/* <a href="#learn-more" className={styles.primaryButtonTop}onClick={handleLearnMoreClick_smart_solutions} >Learn more</a> */}
        
      </div>
    </div>

    <div className={styles.solutionCard}>
      <img src="/image/EV Charger.png"  className={styles.solutionImage} />
      <h3>EV Charger</h3>
      <p>     ที่ชาร์จรถยนต์ไฟฟ้า (Electric Vehicle Charger) เป็นอุปกรณ์ที่ใช้ในการชาร์จพลังงานให้กับรถยนต์ไฟฟ้า (Electric Vehicles - EVs) 
        โดยสามารถชาร์จพลังงานจากแหล่งไฟฟ้าทั่วไปหรือแหล่งพลังงานที่ใช้พลังงานหมุนเวียน เช่น พลังงานแสงอาทิตย์ EV Charger เป็นองค์ประกอบที่สำคัญสำหรับการ
        สนับสนุนการใช้รถยนต์ไฟฟ้าโดยช่วยให้ผู้ใช้สามารถชาร์จพลังงานได้อย่างสะดวกและรวดเร็ว และมีบทบาทในการสร้างระบบขนส่งที่ยั่งยืนและเป็นมิตรกับสิ่งแวดล้อม​​</p>
      <div className={styles.buttonContainerOurservice}>
        {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
      </div>
    </div>

    <div className={styles.solutionCard}>
      <img src="/image/EV Car.png"  className={styles.solutionImage} />
      <h3>EV Car </h3>
      <p>     รถยนต์ไฟฟ้า (Electric Vehicle Car) ยานพาหนะที่ใช้พลังงานไฟฟ้าในการขับเคลื่อนแทนการใช้เครื่องยนต์สันดาปภายในที่ใช้เชื้อเพลิงฟอสซิล (น้ำมันหรือก๊าซ) 
        โดยพลังงานไฟฟ้าที่ใช้มาจากแบตเตอรี่ที่ติดตั้งอยู่ในตัวรถ ซึ่งจะถูกชาร์จผ่าน EV Charger EV Car เป็นหนึ่งในโซลูชันของการขนส่งที่ยั่งยืน ซึ่งไม่เพียงช่วยลดการปล่อยมลพิษและลดค่าใช้จ่ายในการขับขี่ 
        แต่ยังเป็นตัวขับเคลื่อนในการเปลี่ยนแปลงทางเทคโนโลยีและการใช้พลังงานที่เป็นมิตรต่อสิ่งแวดล้อมในระยะยาว​​</p>
      <div className={styles.buttonContainerOurservice}>
        {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
      </div>
    </div>
  </div>


  <div className={styles.threeColumnSolutions}>
  <div className={styles.solutionCard}>
    <img src="/image/EV Truck.png"  className={styles.solutionImage} />
    <h3>EV Truck</h3>
    <p>     รถบรรทุกพลังงานไฟฟ้า (Electric Vehicle Truck) แทนการใช้เชื้อเพลิงฟอสซิล เช่น น้ำมันดีเซลหรือเบนซิน
       โดยรถบรรทุกประเภทนี้ใช้แบตเตอรี่เพื่อเก็บพลังงานไฟฟ้าและมอเตอร์ไฟฟ้าในการขับเคลื่อน​ EV Truck กำลังได้รับความสนใจมากขึ้นในอุตสาหกรรมขนส่ง 
       โดยเฉพาะการขนส่งในเขตเมืองที่ต้องการลดการปล่อยมลพิษและมลภาวะ​</p>
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
    <img src="/image/Energy Management Platform.png"  className={styles.solutionImage} />
    <h3>Energy Management Platform ​</h3>
    <p>     ระบบที่ช่วยจัดการและวิเคราะห์การใช้พลังงานในองค์กรหรืออาคารโดยรวบรวมข้อมูลจากอุปกรณ์และเซ็นเซอร์ต่าง ๆ
       ระบบนี้ช่วยให้ผู้ใช้งานมองเห็นการใช้พลังงานแบบเรียลไทม์ สามารถระบุส่วนที่ใช้พลังงานสูงได้และนำไปสู่การลดการใช้พลังงาน
       ลดต้นทุน และลดการปล่อยก๊าซเรือนกระจก นอกจากนี้ ระบบยังช่วยคาดการณ์และวางแผนการใช้พลังงานในอนาคตอย่างมีประสิทธิภาพ​</p>
    <div className={styles.buttonContainerOurservice}>
    {/* <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a> */}
    </div>
  </div>
 
  
  

 
  

 
  
   </div>
</div>





     
      {/* <div className={styles.BG3}>
        <div className={styles.topic3}>Our Service</div>
        <section className={styles.container}>
          <div className={styles.gridContainer}>
            {topics.map((topic, index) => (
              <div key={index} className={`${styles.circleWrapper} ${styles[`circle${index + 1}`]}`}>
                <button className={styles.circleButton} onClick={() => handleButtonClick(topic)}>
                  <img src={topic.imgSrc} alt={topic.name} />
                  <span>{topic.name}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div> */}
      
    </>
  );
};

export default GreenSolutions_Related;
