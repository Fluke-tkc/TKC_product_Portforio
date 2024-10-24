import React, { useEffect } from "react";
import styles from "./Smart_Platform.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const Smart_Platform = () => { // แก้ไขชื่อ component ให้ตรงกัน


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
           <h1 className={styles.topic}>Smart_Platform</h1>
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
                <h3>1. Internet of Things (IoT)</h3>
                <div className={styles.aboutItemp}>
                การเชื่อมต่ออุปกรณ์ต่างๆ ผ่านอินเทอร์เน็ตเพื่อแลกเปลี่ยนข้อมูลและควบคุมการทำงานของอุปกรณ์จากระยะไกล เช่น ระบบบ้านอัจฉริยะ การควบคุมเครื่องใช้ไฟฟ้า เป็นต้น​
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
                <h3>2. Artificial Intelligence (AI)</h3>
                <div className={styles.aboutItemp}>
                การใช้ปัญญาประดิษฐ์ในการวิเคราะห์ข้อมูล การเรียนรู้พฤติกรรมผู้ใช้ และปรับปรุงการทำงานของระบบให้ฉลาดและตอบสนองต่อความต้องการของผู้ใช้งานมากขึ้น​
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
                <h3>3. Cloud Computing</h3>
                <div className={styles.aboutItemp}>
                การเก็บและประมวลผลข้อมูลบนระบบคลาวด์ ทำให้สามารถเข้าถึงข้อมูลจากที่ใดก็ได้และเพิ่มความยืดหยุ่นในการจัดการทรัพยากร​
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
                <h3>4. Big Data Analytics</h3>
                <div className={styles.aboutItemp}>
                การวิเคราะห์ข้อมูลขนาดใหญ่เพื่อให้ได้ข้อมูลเชิงลึกและช่วยในการตัดสินใจอย่างมีประสิทธิภาพ​
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
                <h3>5. Automation</h3>
                <div className={styles.aboutItemp}>
                ระบบที่ช่วยให้กระบวนการทำงานเป็นอัตโนมัติ ลดการใช้แรงงานคนและเพิ่มความแม่นยำและรวดเร็วในการทำงาน เช่น
                 ระบบหุ่นยนต์ หรือระบบการจัดการทรัพยากรอัตโนมัติ​
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
                <h3>6. Cybersecurity</h3>
                <div className={styles.aboutItemp}>
                มาตรการความปลอดภัยในการปกป้องข้อมูลและระบบจากการโจมตีทางไซเบอร์ เพื่อให้การทำงานของแพลตฟอร์มเป็นไปอย่างปลอดภัย
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
                <h3>​7. User Interface (UI) และ User Experience (UX)</h3>
                <div className={styles.aboutItemp}>
                การออกแบบอินเทอร์เฟซและประสบการณ์ผู้ใช้งานที่ตอบสนองความต้องการและง่ายต่อการใช้งาน ทำให้ผู้ใช้สามารถทำงานกับแพลตฟอร์มได้อย่างสะดวกและมีประสิทธิภาพ​
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
                <h3></h3>
                <div className={styles.aboutItemp}>
                Smart Platform เป็นพื้นฐานสำคัญในการพัฒนาสิ่งต่างๆ เช่น เมืองอัจฉริยะ ระบบการทำงานในภาคธุรกิจ
                 และการพัฒนานวัตกรรมใหม่ๆ ที่เกี่ยวข้องกับการใช้เทคโนโลยีสมัยใหม่เพื่อเพิ่มประสิทธิภาพในการทำงานและการใช้ชีวิตประจำวัน​
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




      
      <Contact/>
    </>
  );
};

export default Smart_Platform;
