import React, { useEffect } from "react";
import styles from "./Smart_Utility.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate

export const Smart_Utility = () => {
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
        <h1 className={styles.title}>Smart Utility </h1>
        <h1 className={styles.title2}> 1. Advanced Metering Infrastructure (AMI)​</h1>
        <p className={styles.description_1}>
        ระบบมิเตอร์อัจฉริยะที่สามารถตรวจสอบและบันทึกการใช้พลังงานของผู้บริโภคแบบเรียลไทม์
         ช่วยให้ผู้ใช้และผู้จัดการพลังงานสามารถวิเคราะห์และปรับเปลี่ยนการใช้พลังงานให้เหมาะสม​
        </p>
      </div>
      {/* <img
        src="/image/Building Automation System.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
    </div>
  </div>
</section>

<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
      {/* <img
          src="/image/Energy Management System (EMS).jpg"
          alt="Me sitting with a laptop"
          className={styles.aboutImage}
        /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 2. Distributed Energy Resources (DER) ​</h1>

        <p className={styles.description_1}>
        การใช้แหล่งพลังงานแบบกระจาย เช่น พลังงานหมุนเวียนจากแสงอาทิตย์ ลม และการผลิตพลังงานจากผู้ใช้ที่สามารถส่งพลังงานกลับเข้าสู่ระบบกริด​
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
        <h1 className={styles.title2}>3. Energy Storage Systems​</h1>
        <p className={styles.description_1}>
        ระบบกักเก็บพลังงาน เช่น แบตเตอรี่ขนาดใหญ่ ช่วยให้สามารถเก็บพลังงานส่วนเกินในช่วงเวลาที่ไม่ต้องการใช้และปล่อยพลังงานเมื่อมีความต้องการสูง​
        </p>
      </div>
      {/* <img
        src="/image/Smart_Lighting.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
    </div>
  </div>
</section>

<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    {/* <img
        src="/image/Smart HVAC (Heating, Ventilation, and Air Conditioning).jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 4. Smart Sensors & Automation​</h1>

        <p className={styles.description_1}>
        เซ็นเซอร์และระบบอัตโนมัติที่ตรวจสอบและควบคุมโครงข่ายไฟฟ้าเพื่อลดการสูญเสียพลังงาน ตรวจจับความเสียหาย และซ่อมแซมโดยอัตโนมัติ
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
        <h1 className={styles.title2}> 5. Demand Response (DR)</h1>
        <p className={styles.description_1}>
        ระบบที่ช่วยให้ผู้บริโภคปรับเปลี่ยนการใช้พลังงานตามสัญญาณหรือข้อมูลจากระบบกริด
         เพื่อรักษาความเสถียรของโครงข่ายไฟฟ้าและช่วยลดภาระในช่วงที่มีความต้องการพลังงานสูง​
        </p>
      </div>
      {/* <img
        src="/image/IoT (Internet of Things)2.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
    </div>
  </div>
</section>

<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    {/* <img
        src="/image/Security System1.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}>6. Energy Management Systems (EMS)​</h1>

        <p className={styles.description_1}>
        ระบบบริหารจัดการพลังงานที่ช่วยผู้จัดการโครงข่ายไฟฟ้าทำการวิเคราะห์และวางแผนการใช้พลังงานทั้งในระยะสั้นและระยะยาว​
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
<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    {/* <img
        src="/image/Security System1.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 7. Grid Cybersecurity​</h1>

        <p className={styles.description_1}>
        มาตรการความปลอดภัยไซเบอร์ที่ออกแบบมาเพื่อป้องกันการโจมตีระบบโครงข่ายไฟฟ้าและปกป้องข้อมูลสำคัญจากภัยคุกคามทางไซเบอร์​
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
<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    {/* <img
        src="/image/Security System1.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 8. Renewable Energy Integration​</h1>

        <p className={styles.description_1}>
        การเชื่อมต่อและบริหารจัดการแหล่งพลังงานหมุนเวียน เช่น พลังงานแสงอาทิตย์และพลังงานลมเข้ากับระบบกริดอย่างมีประสิทธิภาพ
         ทำให้พลังงานจากแหล่งเหล่านี้สามารถใช้งานได้ในวงกว้าง​
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

<section className={styles.container_2  }>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    {/* <img
        src="/image/Security System1.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}>9. Two-way Communication​</h1>

        <p className={styles.description_1}>
        ระบบการสื่อสารสองทางระหว่างผู้ผลิตไฟฟ้า ผู้จัดการโครงข่าย และผู้บริโภค 
        ช่วยให้สามารถแชร์ข้อมูลเกี่ยวกับการผลิตและการใช้พลังงานแบบเรียลไทม์
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

export default Smart_Utility;
