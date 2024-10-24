import React, { useEffect } from "react";
import styles from "./Smart_Logistics.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const Smart_Logistics = () => { // แก้ไขชื่อ component ให้ตรงกัน


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
           <h1 className={styles.topic}>Smart Logistics</h1>
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
                <h3>1. Internet of Things (IoT)​</h3>
                <div className={styles.aboutItemp}>
                อุปกรณ์และเซนเซอร์ที่เชื่อมต่อกับเครือข่ายอินเทอร์เน็ตเพื่อเก็บข้อมูลเรียลไทม์ เช่น ติดตามตำแหน่งของยานพาหนะ 
                การตรวจวัดอุณหภูมิในการขนส่ง หรือการติดตามสถานะของสินค้าในคลัง​
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
                <h3>2. Artificial Intelligence (AI) และ Machine Learning (ML)</h3>
                <div className={styles.aboutItemp}>
                ใช้ในการวิเคราะห์ข้อมูลเพื่อทำการพยากรณ์ความต้องการสินค้า การจัดเส้นทางการขนส่งให้มีประสิทธิภาพ 
                หรือแม้แต่การจัดการคลังสินค้าให้เกิดประสิทธิภาพสูงสุด
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
                <h3>3. Big Data Analytics</h3>
                <div className={styles.aboutItemp}>
                วิเคราะห์ข้อมูลจำนวนมหาศาลเพื่อทำความเข้าใจแนวโน้มและปรับปรุงการทำงานของระบบโลจิสติกส์ เช่น การคาดการณ์การขนส่ง การจัดสรรทรัพยากรอย่างเหมาะสม​
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
                <h3>4. Automation</h3>
                <div className={styles.aboutItemp}>
                การใช้ระบบอัตโนมัติเพื่อช่วยลดเวลาการทำงานและลดข้อผิดพลาด เช่น หุ่นยนต์ในคลังสินค้า ระบบจัดการสินค้าอัตโนมัติ​
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
                <h3>5. Blockchain</h3>
                <div className={styles.aboutItemp}>
                ใช้เพื่อสร้างความโปร่งใสในการทำธุรกรรมและการติดตามสินค้าในห่วงโซ่อุปทาน ทำให้สามารถตรวจสอบย้อนกลับและป้องกันการปลอมแปลงได้​
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
                <h3>6. Cloud Computing</h3>
                <div className={styles.aboutItemp}>
                การจัดการข้อมูลและการประมวลผลผ่านระบบคลาวด์ ช่วยให้ทุกฝ่ายที่เกี่ยวข้องสามารถเข้าถึงข้อมูลได้จากทุกที่และทุกเวลา​
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
                <h3>7. Autonomous Vehicles และ Drones</h3>
                <div className={styles.aboutItemp}>
                การขนส่งสินค้าโดยใช้ยานยนต์อัตโนมัติหรือโดรน เพื่อลดการพึ่งพาคนขับ ลดต้นทุน และเพิ่มประสิทธิภาพการขนส่ง
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
                <h3>8. Smart Warehousing</h3>
                <div className={styles.aboutItemp}>
                คลังสินค้าอัจฉริยะที่มีการจัดการสินค้าผ่านระบบอัตโนมัติ การใช้หุ่นยนต์จัดเรียงสินค้า และระบบควบคุมอุณหภูมิอัตโนมัติ​
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
                <h3>9. Digital Twins</h3>
                <div className={styles.aboutItemp}>
                การสร้างโมเดลดิจิทัลจำลองของกระบวนการโลจิสติกส์หรือยานพาหนะ เพื่อทำการวิเคราะห์และทดสอบการทำงานในสภาพแวดล้อมเสมือน​
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
                การนำองค์ประกอบเหล่านี้มารวมกันจะช่วยให้โลจิสติกส์สามารถทำงานได้รวดเร็ว แม่นยำ และมีประสิทธิภาพมากขึ้น
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

export default Smart_Logistics;
