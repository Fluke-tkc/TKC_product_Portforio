import React, { useEffect } from "react";
import styles from "./GreenSolutions_component.module.css";
import { Navbar } from "../Navbar/Navbar";
import { Contact } from "../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const GreenSolutions_component = () => { // แก้ไขชื่อ component ให้ตรงกัน


  const navigate = useNavigate();



  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // เลื่อนไปยังตำแหน่งทันทีโดยไม่มีการหน่วง
    });
  }, []);


  const handleLearnMoreClick_smart_Building = () => {
    navigate("/green-solutions-component");
  };
  return (
    <>
    
      <section className={styles.container} id="about">
        {/* <h2 className={styles.title}>Smart Building</h2> */}
        
        <div className={styles.content}>
        {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}

          <ul className={styles.aboutItems}>
            <li className={styles.aboutItem}>
              <div className={styles.aboutItemText}>
                <h3>องค์ประกอบของ Green Solution:</h3>
                <div className={styles.aboutItemp}>
               1. พลังงานทดแทน (Renewable Energy): การใช้พลังงานจากแหล่งที่หมุนเวียนได้ เช่น
               <br></br>
                พลังงานแสงอาทิตย์, พลังงานลม, และพลังงานจากชีวมวล ซึ่งช่วยลดการพึ่งพาพลังงานฟอสซิล
                <br></br>
                และลดการปล่อยก๊าซเรือนกระจก​ 
                <br></br>
                <br></br>
              2. การใช้วัสดุที่ยั่งยืน (Sustainable Materials): การเลือกใช้วัสดุที่มีผลกระทบต่อ
              <br></br>
              สิ่งแวดล้อมน้อย  เช่น วัสดุรีไซเคิล, วัสดุจากธรรมชาติ, และวัสดุที่มีการผลิตอย่างยั่งยืน​
              <br></br>
              <br></br>
              3. การจัดการขยะ (Waste Management): การนำเสนอแนวทางในการลดการผลิตขยะ, 
              <br></br>
              การรีไซเคิล, และการใช้ซ้ำ เพื่อลดปริมาณขยะที่ต้องกำจัด​
              <br></br>
              <br></br>
              4. การอนุรักษ์น้ำ (Water Conservation): การใช้วิธีการต่าง ๆ เพื่อประหยัดน้ำ เช่น 
              <br></br>
              ระบบการชลประทานที่มีประสิทธิภาพ, การเก็บน้ำฝน, และการใช้เทคโนโลยีในการลดการใช้น้ำ​
              <br></br>
              <br></br>

              5. การพัฒนาอย่างยั่งยืน (Sustainable Development): การวางแผนและดำเนินการ
              <br></br>
              พัฒนาที่คำนึงถึงผลกระทบต่อสิ่งแวดล้อมและสังคม โดยไม่ทำลายทรัพยากรสำหรับอนาคต​
              <br></br>
              <br></br>

              6. การสนับสนุนการขนส่งที่เป็นมิตรต่อสิ่งแวดล้อม (Eco-Friendly Transportation):
              <br></br>
               การส่งเสริมการใช้รถยนต์ไฟฟ้า, ระบบขนส่งสาธารณะที่มีประสิทธิภาพ, และการเดินหรือปั่นจักรยาน​
               <br></br>
               <br></br>

              ประโยชน์ของ Green Solution:​
              <br></br>
              - ลดการปล่อยก๊าซเรือนกระจก​
              <br></br>
              - ปรับปรุงคุณภาพอากาศและน้ำ​
              <br></br>
              - สร้างความยั่งยืนในระบบนิเวศ​
              <br></br>
              - ประหยัดค่าใช้จ่ายในระยะยาว​
              <br></br>
              - เพิ่มความเชื่อมั่นและการรับรู้ในแบรนด์ที่มีความรับผิดชอบต่อสิ่งแวดล้อม​

​
                  {/* <div className={styles.buttonContainer}>
                  <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Building} >เพื่มเติม</a>
                  </div> */}
                  </div>

                
              </div>
              <img
          src="/image/greensolution.png" 
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         />
            </li>
            
          </ul>
          {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
        </div>
      </section>
    
    </>
  );
};

export default GreenSolutions_component;
