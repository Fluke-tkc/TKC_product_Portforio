import React, { useEffect } from "react";
import styles from "./Smart_Farm.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate

export const Smart_Farm = () => {
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
        <h1 className={styles.title}>Smart Farm</h1>
        <h1 className={styles.title2}> 1. การตรวจวัดสภาพแวดล้อม</h1>
        <p className={styles.description_1}>
        - เซ็นเซอร์ตรวจวัดความชื้นในดิน: ใช้ในการตรวจสอบระดับความชื้นในดินแบบเรียลไทม์ เมื่อความชื้นต่ำกว่าระดับที่ตั้งค่าไว้ ระบบจะสั่งการให้น้ำโดยอัตโนมัติ​
        <br></br>
        - เซ็นเซอร์วัดอุณหภูมิและความชื้นในอากาศ: ใช้ตรวจวัดสภาพอากาศในฟาร์ม หากอุณหภูมิหรือความชื้นไม่เหมาะสม ระบบสามารถเปิด-ปิดเครื่องปรับอากาศหรือน้ำหมอกอัตโนมัติ
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
        <h1 className={styles.title2}>  2. การจัดการน้ำ</h1>

        <p className={styles.description_1}>
        - ระบบให้น้ำอัตโนมัติ: IoT ควบคุมการเปิด-ปิดระบบน้ำจากข้อมูลที่ได้รับจากเซ็นเซอร์ความชื้นในดิน โดยสามารถลดปริมาณการใช้น้ำได้อย่างมีประสิทธิภาพ​
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
        <h1 className={styles.title2}> 3. การควบคุมแสง</h1>
        <p className={styles.description_1}>
        - เซ็นเซอร์วัดแสง: ตรวจวัดปริมาณแสงที่พืชได้รับ หากแสงน้อยเกินไป ระบบจะสั่งเปิดไฟเสริมที่เหมาะสมกับพืช​
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
        <h1 className={styles.title2}>  4. การวิเคราะห์ดินและปุ๋ย</h1>

        <p className={styles.description_1}>
        - เซ็นเซอร์ตรวจวัดค่า pH และความสมบูรณ์ของดิน: ช่วยในการประเมินปริมาณปุ๋ยและการจัดการสารอาหารที่เหมาะสมกับพืช​
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
        <h1 className={styles.title2}> 5. การควบคุมศัตรูพืช</h1>
        <p className={styles.description_1}>
        - ระบบตรวจจับศัตรูพืช: ใช้กล้องหรือเซ็นเซอร์ตรวจจับการเคลื่อนไหวหรือเสียงของศัตรูพืชในฟาร์ม และใช้ AI ในการวิเคราะห์เพื่อควบคุมการแพร่ระบาด​
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
        <h1 className={styles.title2}>  6. การตรวจสอบผลผลิต</h1>

        <p className={styles.description_1}>
        - Drones: ใช้โดรนติดตั้งกล้องและเซ็นเซอร์ในการสำรวจผลผลิตในพื้นที่ขนาดใหญ่แบบอัตโนมัติ 
          ช่วยตรวจสอบการเติบโตของพืชและสภาพพื้นที่​อุปกรณ์ IoT และ Sensor ที่ใช้ใน Smart Farm​
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

 การทำงานร่วมกัน
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



      <Contact />
    </>
  );
};

export default Smart_Farm;
