import React, { useEffect } from "react";
import styles from "./Smart_Hospital.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom";

export const Smart_Hospital = () => { // แก้ไขชื่อ component ให้ตรงกัน


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
           <h1 className={styles.topic}>Smart Hospital</h1>
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
                อุปกรณ์และเซนเซอร์ต่าง ๆ ที่ใช้ในการตรวจวัดสัญญาณชีพของผู้ป่วยแบบเรียลไทม์ เช่น เครื่องวัดความดันโลหิต เครื่องตรวจคลื่นหัวใจ
                 หรืออุปกรณ์ติดตามการเคลื่อนไหว ซึ่งจะส่งข้อมูลไปยังแพทย์หรือพยาบาลทันทีหากเกิดเหตุผิดปกติ​
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
                ใช้ในการวิเคราะห์ข้อมูลผู้ป่วยเพื่อช่วยวินิจฉัยโรค การทำนายความเสี่ยงของโรค หรือแนะนำแนวทางการรักษา AI
                 ยังสามารถใช้ในการวิเคราะห์ภาพทางการแพทย์ เช่น การตรวจเอกซเรย์หรือ MRI​
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
                <h3>3. Robotics</h3>
                <div className={styles.aboutItemp}>
                ระบบไฟฟ้าที่สามารถปรับความสว่างได้ตามความต้องการโดยอัตโนมัติ เช่น การใช้เซนเซอร์ตรวจจับการเคลื่อนไหว 
                หรือการใช้แสงธรรมชาติร่วมกับแสงไฟประดิษฐ์เพื่อประหยัดพลังงาน​
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
                <h3>4. Smart HVAC (Heating, Ventilation, and Air Conditioning)</h3>
                <div className={styles.aboutItemp}>
                ระบบปรับอากาศอัจฉริยะที่สามารถปรับอุณหภูมิและการระบายอากาศตามสภาพอากาศหรือการใช้งานจริงของห้อง 
                ช่วยเพิ่มความสะดวกสบายและลดการใช้พลังงาน
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
                <h3>5. IoT (Internet of Things)</h3>
                <div className={styles.aboutItemp}>
                อุปกรณ์และเซนเซอร์ต่าง ๆ ที่เชื่อมต่อกันเพื่อเก็บและส่งข้อมูล เช่น เซนเซอร์ตรวจวัดอุณหภูมิ ความชื้น
                 และคุณภาพอากาศในห้อง หรืออุปกรณ์ตรวจสอบการใช้พลังงานของเครื่องใช้ไฟฟ้า​​
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
                <h3>6. Security System</h3>
                <div className={styles.aboutItemp}>
                ระบบรักษาความปลอดภัยอัจฉริยะ เช่น กล้องวงจรปิดที่เชื่อมต่อกับ AI ในการวิเคราะห์และตรวจจับความผิดปกติ
                 ระบบควบคุมการเข้าถึงที่ใช้การสแกนใบหน้า ลายนิ้วมือ หรือการใช้คีย์การ์ด รวมถึงระบบตรวจจับและป้องกันอัคคีภัย​
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
                <h3>7. Smart Water Management</h3>
                <div className={styles.aboutItemp}>
                ระบบจัดการน้ำที่สามารถตรวจสอบและควบคุมการใช้น้ำภายในอาคาร ช่วยลดการใช้น้ำสิ้นเปลือง เช่น 
                ระบบน้ำพุอัจฉริยะที่สามารถปรับการจ่ายน้ำตามความต้องการ​
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
                <h3>6. Security System</h3>
                <div className={styles.aboutItemp}>
                ระบบรักษาความปลอดภัยอัจฉริยะ เช่น กล้องวงจรปิดที่เชื่อมต่อกับ AI ในการวิเคราะห์และตรวจจับความผิดปกติ
                 ระบบควบคุมการเข้าถึงที่ใช้การสแกนใบหน้า ลายนิ้วมือ หรือการใช้คีย์การ์ด รวมถึงระบบตรวจจับและป้องกันอัคคีภัย​
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
                <h3>7. Smart Water Management</h3>
                <div className={styles.aboutItemp}>
                ระบบจัดการน้ำที่สามารถตรวจสอบและควบคุมการใช้น้ำภายในอาคาร ช่วยลดการใช้น้ำสิ้นเปลือง เช่น 
                ระบบน้ำพุอัจฉริยะที่สามารถปรับการจ่ายน้ำตามความต้องการ​
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
                <h3>8. Predictive Maintenance</h3>
                <div className={styles.aboutItemp}>
                การบำรุงรักษาเชิงคาดการณ์ โดยใช้เซนเซอร์ตรวจจับสภาพของอุปกรณ์ต่าง ๆ เช่น เครื่องปรับอากาศ หรือลิฟต์ 
                และวิเคราะห์ข้อมูลเพื่อตรวจสอบปัญหาที่อาจเกิดขึ้น ทำให้สามารถซ่อมบำรุงก่อนที่อุปกรณ์จะเสียหาย
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
                <h3>9. Smart Metering</h3>
                <div className={styles.aboutItemp}>
                ปกรณ์ที่ใช้ในการวัดและตรวจสอบการใช้พลังงานไฟฟ้า น้ำ และแก๊ส แบบเรียลไทม์ 
                ซึ่งช่วยให้เจ้าของอาคารสามารถวางแผนการใช้งานได้อย่างมีประสิทธิภาพมากขึ้น​
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
                <h3>10. Renewable Energy Integration</h3>
                <div className={styles.aboutItemp}>
                การผสานพลังงานหมุนเวียน เช่น พลังงานแสงอาทิตย์และพลังงานลม เข้าไว้กับระบบอาคาร เช่น 
                การติดตั้งแผงโซลาร์เซลล์บนหลังคา เพื่อลดการพึ่งพาพลังงานจากแหล่งอื่น​
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
                <h3>11. Data Analytics</h3>
                <div className={styles.aboutItemp}>
                การใช้ข้อมูลและการวิเคราะห์เพื่อปรับปรุงการทำงานของระบบต่าง ๆ ภายในอาคาร เช่น 
                การวิเคราะห์การใช้พลังงานเพื่อหาวิธีลดการใช้ หรือการใช้ข้อมูลจากอุปกรณ์ IoT เพื่อปรับปรุงความสะดวกสบายของผู้ใช้อาคาร​
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
                <h3>12. Connectivity and 5G</h3>
                <div className={styles.aboutItemp}>
                ระบบการเชื่อมต่อที่มีประสิทธิภาพ เช่น อินเทอร์เน็ตความเร็วสูงและเครือข่าย 5G 
                ซึ่งเป็นโครงสร้างพื้นฐานสำคัญสำหรับการทำงานของเทคโนโลยีอัจฉริยะในอาคาร​
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
                Smart Building ช่วยให้การบริหารจัดการอาคารเป็นไปอย่างมีประสิทธิภาพ ทั้งในแง่การประหยัดพลังงาน 
                การดูแลรักษาความปลอดภัย และการสร้างสภาพแวดล้อมที่น่าอยู่สำหรับผู้ใช้อาคาร​
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

export default Smart_Hospital;
