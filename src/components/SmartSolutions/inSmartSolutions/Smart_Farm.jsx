import React, { useEffect } from "react";
import styles from "./Smart_Farm.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const Smart_Farm = () => { // แก้ไขชื่อ component ให้ตรงกัน


  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // เลื่อนไปยังตำแหน่งทันทีโดยไม่มีการหน่วง
    });
  }, []);


  
  return (
    <>
    <Navbar/>
   
    <section className={styles.container} >
     
  
     
     <div className={styles.content}>
    

       <ul className={styles.aboutItems}>
         <li className={styles.aboutItem}>
           <div className={styles.aboutItemText}>
           <h1 className={styles.topic}>Smart Farm</h1>
             <div className={styles.aboutItemp}>
            
             
               </div>
               </div>
         </li>
         
       </ul>
      
     </div>


   </section>



      <section className={styles.container} >
     
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
                <h3>1. การตรวจวัดสภาพแวดล้อม</h3>
                <div className={styles.aboutItemp}>
                - เซ็นเซอร์ตรวจวัดความชื้นในดิน: ใช้ในการตรวจสอบระดับความชื้นในดินแบบเรียลไทม์ เมื่อความชื้นต่ำกว่าระดับที่ตั้งค่าไว้ 
                   ระบบจะสั่งการให้น้ำโดยอัตโนมัติ​
                   <br></br>
                - เซ็นเซอร์วัดอุณหภูมิและความชื้นในอากาศ: ใช้ตรวจวัดสภาพอากาศในฟาร์ม หากอุณหภูมิหรือความชื้นไม่เหมาะสม
                   ระบบสามารถเปิด-ปิดเครื่องปรับอากาศหรือน้ำหมอกอัตโนมัติ​
                  <div className={styles.buttonContainer}>
                  {/* <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Building} >เพื่มเติม</a> */}
                  </div>
                  </div>

                
              </div>
              {/* <img
          src="/image/Smart_Building.jpg" 
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
            </li>
            
          </ul>
          {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
        </div>


      </section>



          <section className={styles.container}>
        {/* <h2 className={styles.title}>Smart Building</h2> */}
        
        <div className={styles.content}>
        {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}

          <ul className={styles.aboutItems}>
            <li className={styles.aboutItem}>
            {/* <img
          src="/image/Smart_Farm1.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
              <div className={styles.aboutItemText}>
                <h3>2. การจัดการน้ำ</h3>
                <div className={styles.aboutItemp}>
                - ระบบให้น้ำอัตโนมัติ: IoT ควบคุมการเปิด-ปิดระบบน้ำจากข้อมูลที่ได้รับจากเซ็นเซอร์ความชื้นในดิน 
                โดยสามารถลดปริมาณการใช้น้ำได้อย่างมีประสิทธิภาพ​
                  <div className={styles.buttonContainer}>
                  {/* <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Farm} >เพื่มเติม</a> */}
                  </div>
                  </div>

                
              </div>
              {/* <img
          src="/image/Smart_Farm1.jpg" 
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
            </li>
            
          </ul>
          {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
        </div>
      </section>



      <section className={styles.container} >
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
                <h3>3. การควบคุมแสง</h3>
                <div className={styles.aboutItemp}>
                - เซ็นเซอร์วัดแสง: ตรวจวัดปริมาณแสงที่พืชได้รับ หากแสงน้อยเกินไป ระบบจะสั่งเปิดไฟเสริมที่เหมาะสมกับพืช​
                  <div className={styles.buttonContainer}>
                  {/* <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Building} >เพื่มเติม</a> */}
                  </div>
                  </div>

                
              </div>
              {/* <img
          src="/image/Smart_Building.jpg" 
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
            </li>
            
          </ul>
          {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
        </div>


      </section>

       <section className={styles.container}>
        {/* <h2 className={styles.title}>Smart Building</h2> */}
        
        <div className={styles.content}>
        {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}

          <ul className={styles.aboutItems}>
            <li className={styles.aboutItem}>
            {/* <img
          src="/image/Smart_Farm1.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
              <div className={styles.aboutItemText}>
                <h3>4. การวิเคราะห์ดินและปุ๋ย</h3>
                <div className={styles.aboutItemp}>
                - เซ็นเซอร์ตรวจวัดค่า pH และความสมบูรณ์ของดิน: ช่วยในการประเมินปริมาณปุ๋ยและการจัดการสารอาหารที่เหมาะสมกับพืช​
                  <div className={styles.buttonContainer}>
                  {/* <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Farm} >เพื่มเติม</a> */}
                  </div>
                  </div>

                
              </div>
              {/* <img
          src="/image/Smart_Farm1.jpg" 
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
            </li>
            
          </ul>
          {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
        </div>
      </section>



      <section className={styles.container} >
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
                <h3>5. การควบคุมศัตรูพืช</h3>
                <div className={styles.aboutItemp}>
                - ระบบตรวจจับศัตรูพืช: ใช้กล้องหรือเซ็นเซอร์ตรวจจับการเคลื่อนไหวหรือเสียงของศัตรูพืชในฟาร์ม 
                และใช้ AI ในการวิเคราะห์เพื่อควบคุมการแพร่ระบาด​
                  <div className={styles.buttonContainer}>
                  {/* <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Building} >เพื่มเติม</a> */}
                  </div>
                  </div>

                
              </div>
              {/* <img
          src="/image/Smart_Building.jpg" 
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
            </li>
            
          </ul>
          {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
        </div>


      </section>

      <section className={styles.container}>
        {/* <h2 className={styles.title}>Smart Building</h2> */}
        
        <div className={styles.content}>
        {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}

          <ul className={styles.aboutItems}>
            <li className={styles.aboutItem}>
            {/* <img
          src="/image/Smart_Farm1.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
              <div className={styles.aboutItemText}>
                <h3>6. การตรวจสอบผลผลิต</h3>
                <div className={styles.aboutItemp}>
                - Drones: ใช้โดรนติดตั้งกล้องและเซ็นเซอร์ในการสำรวจผลผลิตในพื้นที่ขนาดใหญ่แบบอัตโนมัติ ช่วยตรวจสอบการเติบโตของพืชและสภาพพื้นที่​อุปกรณ์ IoT และ Sensor ที่ใช้ใน Smart Farm​
                 <br></br>
                 1. Soil Moisture Sensors: วัดความชื้นในดินเพื่อการจัดการน้ำที่แม่นยำ​
                 <br></br>
                 2. Temperature and Humidity Sensors: ตรวจสอบสภาพอุณหภูมิและความชื้นในอากาศ​
                 <br></br>
                3. Light Sensors: ตรวจวัดระดับแสงเพื่อปรับแสงที่เหมาะสมสำหรับพืช​
                <br></br>
                 4. pH Sensors: ใช้ในการวัดค่าความเป็นกรด-ด่างในดิน​
                 <br></br>
                 5. Drones and Cameras: สำรวจสภาพพืชผลและติดตามสถานะการเติบโต​
                 <br></br>
                 6. Automated Irrigation Systems: ระบบรดน้ำอัตโนมัติที่สามารถควบคุมผ่านสมาร์ทโฟน​


                  <div className={styles.buttonContainer}>
                  {/* <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Farm} >เพื่มเติม</a> */}
                  </div>
                  </div>

                
              </div>
              {/* <img
          src="/image/Smart_Farm1.jpg" 
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
            </li>
            
          </ul>
          {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
        </div>
      </section>



      <section className={styles.container} >
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
                <h3></h3>
                <div className={styles.aboutItemp}>
                การทำงานร่วมกัน​
                <br></br>
                <br></br>
                อุปกรณ์ IoT จะส่งข้อมูลจากเซ็นเซอร์ต่าง ๆ ไปยัง แพลตฟอร์มจัดการข้อมูลกลาง (Cloud Platform)
                 ซึ่งระบบสามารถวิเคราะห์ข้อมูลและแสดงผลผ่านแอปพลิเคชันหรือหน้าเว็บที่เกษตรกรสามารถเข้าถึงได้เพื่อควบคุมและตรวจสอบการทำงานของฟาร์ม
                 <br></br>
                 <br></br>
                 ​การใช้ IoT และ Sensor ใน Smart Farm ช่วยให้เกษตรกรสามารถตัดสินใจอย่างแม่นยำ ปรับปรุงประสิทธิภาพการใช้ทรัพยากร และเพิ่มผลผลิตได้อย่างมีประสิทธิภาพ
                  <div className={styles.buttonContainer}>
                  {/* <a className={styles.primaryButton}onClick={handleLearnMoreClick_smart_Building} >เพื่มเติม</a> */}
                  </div>
                  </div>

                
              </div>
              {/* <img
          src="/image/Smart_Building.jpg" 
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
            </li>
            
          </ul>
          {/* <img
          src="/image/Smart_Hospital.jpg"  // แก้ไขตรงนี้เป็น path ของรูปภาพที่ถูกต้อง
            alt="Me sitting with a laptop"
            className={styles.aboutImage}
         /> */}
        </div>


      </section>

      
  
      
      <Contact/>
    </>
  );
};

export default Smart_Farm;
