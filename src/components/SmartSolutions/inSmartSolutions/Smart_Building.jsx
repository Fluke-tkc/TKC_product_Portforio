import React, { useEffect } from "react";
import styles from "./Smart_Building.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate

export const Smart_Building = () => {
//   const navigate = useNavigate();

  // ฟังก์ชันที่จะนำทางไปยังหน้า SmartSolutions_Building
//   const handleLearnMoreClick_smart_Building = () => {
//     navigate("/smart-solutions-building"); // URL ที่ต้องการนำทาง
//   };
useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto", // เลื่อนไปยังตำแหน่งทันทีโดยไม่มีการหน่วง
  });
}, []);


  return (
    <>
      <Navbar />
      <section className={styles.container}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}>Smart Building</h1>
        <h1 className={styles.title2}> 1. Building Automation System (BAS)</h1>
        <p className={styles.description_1}>
          ระบบอัตโนมัติที่ควบคุมการทำงานของระบบต่าง ๆ ภายในอาคาร เช่น การปรับอากาศ (HVAC), ระบบไฟฟ้า, 
          ระบบรักษาความปลอดภัย และระบบน้ำ โดยสามารถควบคุมและตรวจสอบผ่านซอฟต์แวร์หรืออุปกรณ์มือถือ​ 
        </p>
      </div>
      <img
        src="/image/Building Automation System.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />
    </div>
  </div>
</section>

<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    <img
        src="/image/Energy Management System (EMS).jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> 
      <div className={styles.textContainer}>
        
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}>  2. Energy Management System (EMS)</h1>
        
        <p className={styles.description_1}>
          ระบบจัดการพลังงานที่ช่วยควบคุมการใช้พลังงานอย่างมีประสิทธิภาพ เช่น การควบคุมไฟฟ้า
           การปรับอุณหภูมิ และการใช้พลังงานหมุนเวียน (Renewable Energy) เพื่อลดการสิ้นเปลืองพลังงาน​
        </p>
        
      </div>
       {/* <img
        src="/image/Building Automation System.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />  */}
    </div>
  </div>
</section>

<section className={styles.container}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 3. Smart Lighting (BAS)</h1>
        <p className={styles.description_1}>
        ระบบไฟฟ้าที่สามารถปรับความสว่างได้ตามความต้องการโดยอัตโนมัติ เช่น การใช้เซนเซอร์ตรวจจับการเคลื่อนไหว 
        หรือการใช้แสงธรรมชาติร่วมกับแสงไฟประดิษฐ์เพื่อประหยัดพลังงาน​
        </p>
      </div>
      <img
        src="/image/Smart_Lighting.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />
    </div>
  </div>
</section>

<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    <img
        src="/image/Smart HVAC (Heating, Ventilation, and Air Conditioning).jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> 
      <div className={styles.textContainer}>
        
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}>  4. Smart HVAC (Heating, Ventilation, and Air Conditioning)</h1>
        
        <p className={styles.description_1}>
        ระบบปรับอากาศอัจฉริยะที่สามารถปรับอุณหภูมิและการระบายอากาศตามสภาพอากาศหรือการใช้งานจริงของห้อง
         ช่วยเพิ่มความสะดวกสบายและลดการใช้พลังงาน​​
        </p>
        
      </div>
       {/* <img
        src="/image/Building Automation System.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />  */}
    </div>
  </div>
</section>

<section className={styles.container}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 5. IoT (Internet of Things) (BAS)</h1>
        <p className={styles.description_1}>
        ปกรณ์และเซนเซอร์ต่าง ๆ ที่เชื่อมต่อกันเพื่อเก็บและส่งข้อมูล เช่น เซนเซอร์ตรวจวัดอุณหภูมิ ความชื้น 
        และคุณภาพอากาศในห้อง หรืออุปกรณ์ตรวจสอบการใช้พลังงานของเครื่องใช้ไฟฟ้า​
        </p>
      </div>
      <img
        src="/image/IoT (Internet of Things)2.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />
    </div>
  </div>
</section>

<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    <img  
        src="/image/Security System1.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> 
      <div className={styles.textContainer}>
        
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}>  6. Security System</h1>
        
        <p className={styles.description_1}>
        ระบบรักษาความปลอดภัยอัจฉริยะ เช่น กล้องวงจรปิดที่เชื่อมต่อกับ AI ในการวิเคราะห์และตรวจจับความผิดปกติ 
        ระบบควบคุมการเข้าถึงที่ใช้การสแกนใบหน้า ลายนิ้วมือ หรือการใช้คีย์การ์ด รวมถึงระบบตรวจจับและป้องกันอัคคีภัย​
        </p>
        
      </div>
       {/* <img
        src="/image/Building Automation System.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />  */}
    </div>
  </div>
</section>

<section className={styles.container}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 7. Smart Water Management</h1>
        <p className={styles.description_1}>
        ระบบจัดการน้ำที่สามารถตรวจสอบและควบคุมการใช้น้ำภายในอาคาร ช่วยลดการใช้น้ำสิ้นเปลือง เช่น
         ระบบน้ำพุอัจฉริยะที่สามารถปรับการจ่ายน้ำตามความต้องการ​
        </p>
      </div>
      <img
        src="/image/Smart Water Management2.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />
    </div>
  </div>
</section>

<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    <img
        src="/image/Predictive Maintenance.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> 
      <div className={styles.textContainer}>
        
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}>  8. Predictive Maintenance</h1>
        
        <p className={styles.description_1}>
        การบำรุงรักษาเชิงคาดการณ์ โดยใช้เซนเซอร์ตรวจจับสภาพของอุปกรณ์ต่าง ๆ เช่น เครื่องปรับอากาศ หรือลิฟต์ 
          และวิเคราะห์ข้อมูลเพื่อตรวจสอบปัญหาที่อาจเกิดขึ้น ทำให้สามารถซ่อมบำรุงก่อนที่อุปกรณ์จะเสียหาย​
        </p>
        
      </div>
       {/* <img
        src="/image/Building Automation System.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />  */}
    </div>
  </div>
</section>

<section className={styles.container}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 9. Smart Metering</h1>
        <p className={styles.description_1}>
        อุปกรณ์ที่ใช้ในการวัดและตรวจสอบการใช้พลังงานไฟฟ้า น้ำ และแก๊ส แบบเรียลไทม์ 
        ซึ่งช่วยให้เจ้าของอาคารสามารถวางแผนการใช้งานได้อย่างมีประสิทธิภาพมากขึ้น​
        </p>
      </div>
      <img
        src="/image/Smart Metering1.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />
    </div>
  </div>
</section>
      

<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    <img
        src="/image/Renewable Energy Integration1.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> 
      <div className={styles.textContainer}>
        
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}>  10. Renewable Energy Integration</h1>
        
        <p className={styles.description_1}>
        การผสานพลังงานหมุนเวียน เช่น พลังงานแสงอาทิตย์และพลังงานลม เข้าไว้กับระบบอาคาร เช่น 
        การติดตั้งแผงโซลาร์เซลล์บนหลังคา เพื่อลดการพึ่งพาพลังงานจากแหล่งอื่น​
        </p>
        
      </div>
       {/* <img
        src="/image/Building Automation System.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />  */}
    </div>
  </div>
</section>

<section className={styles.container}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 11. Data Analytics</h1>
        <p className={styles.description_1}>
        การใช้ข้อมูลและการวิเคราะห์เพื่อปรับปรุงการทำงานของระบบต่าง ๆ ภายในอาคาร เช่น การวิเคราะห์การใช้พลังงานเพื่อหาวิธีลดการใช้
         หรือการใช้ข้อมูลจากอุปกรณ์ IoT เพื่อปรับปรุงความสะดวกสบายของผู้ใช้อาคาร​
        </p>
      </div>
      <img
        src="/image/Data Analytics1.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />
    </div>
  </div>
</section>
      
<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    <img
        src="/image/Connectivity and 5G2.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> 
      <div className={styles.textContainer}>
        
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}>  12. Connectivity and 5G</h1>
        
        <p className={styles.description_1}>
        ระบบการเชื่อมต่อที่มีประสิทธิภาพ เช่น อินเทอร์เน็ตความเร็วสูงและเครือข่าย 5G 
        ซึ่งเป็นโครงสร้างพื้นฐานสำคัญสำหรับการทำงานของเทคโนโลยีอัจฉริยะในอาคาร​​
        </p>
        
      </div>
       {/* <img
        src="/image/Building Automation System.jpg" 
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      />  */}
    </div>
    <br>
</br><br>
</br><br>
</br>
  </div>
  
</section>

      
    
     

      <Contact />
    </>
  );
};

export default Smart_Building;
