import React from "react";
import styles from "./Smart_Logistics.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate

export const Smart_Logistics = () => {
//   const navigate = useNavigate();

  // ฟังก์ชันที่จะนำทางไปยังหน้า SmartSolutions_Building
//   const handleLearnMoreClick_smart_Building = () => {
//     navigate("/smart-solutions-building"); // URL ที่ต้องการนำทาง
//   };

  return (
    <>
      <Navbar />
      <section className={styles.container}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}>Smart Logistics</h1>
        <h1 className={styles.title2}> 1. Internet of Things (IoT)​</h1>
        <p className={styles.description_1}>
        อุปกรณ์และเซนเซอร์ที่เชื่อมต่อกับเครือข่ายอินเทอร์เน็ตเพื่อเก็บข้อมูลเรียลไทม์ เช่น ติดตามตำแหน่งของยานพาหนะ 
        การตรวจวัดอุณหภูมิในการขนส่ง หรือการติดตามสถานะของสินค้าในคลัง​
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
        <h1 className={styles.title2}> 2. Artificial Intelligence (AI) และ Machine Learning (ML) ​</h1>

        <p className={styles.description_1}>
        ใช้ในการวิเคราะห์ข้อมูลเพื่อทำการพยากรณ์ความต้องการสินค้า การจัดเส้นทางการขนส่งให้มีประสิทธิภาพ
         หรือแม้แต่การจัดการคลังสินค้าให้เกิดประสิทธิภาพสูงสุด​
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
        <h1 className={styles.title2}> 3. Big Data Analytics​</h1>
        <p className={styles.description_1}>
        วิเคราะห์ข้อมูลจำนวนมหาศาลเพื่อทำความเข้าใจแนวโน้มและปรับปรุงการทำงานของระบบโลจิสติกส์ เช่น การคาดการณ์การขนส่ง
         การจัดสรรทรัพยากรอย่างเหมาะสม​
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
        <h1 className={styles.title2}> 4. Automation​</h1>

        <p className={styles.description_1}>
        การใช้ระบบอัตโนมัติเพื่อช่วยลดเวลาการทำงานและลดข้อผิดพลาด เช่น หุ่นยนต์ในคลังสินค้า ระบบจัดการสินค้าอัตโนมัติ​
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
        <h1 className={styles.title2}> 5. Blockchain</h1>
        <p className={styles.description_1}>
        ใช้เพื่อสร้างความโปร่งใสในการทำธุรกรรมและการติดตามสินค้าในห่วงโซ่อุปทาน ทำให้สามารถตรวจสอบย้อนกลับและป้องกันการปลอมแปลงได้​
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
        <h1 className={styles.title2}> 6. Cloud Computing​</h1>

        <p className={styles.description_1}>
        การจัดการข้อมูลและการประมวลผลผ่านระบบคลาวด์ ช่วยให้ทุกฝ่ายที่เกี่ยวข้องสามารถเข้าถึงข้อมูลได้จากทุกที่และทุกเวลา​
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
        <h1 className={styles.title2}> 7. Autonomous Vehicles และ Drones​</h1>

        <p className={styles.description_1}>
        การขนส่งสินค้าโดยใช้ยานยนต์อัตโนมัติหรือโดรน เพื่อลดการพึ่งพาคนขับ ลดต้นทุน และเพิ่มประสิทธิภาพการขนส่ง​
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
        <h1 className={styles.title2}> 8. Smart Warehousing​</h1>

        <p className={styles.description_1}>
        คลังสินค้าอัจฉริยะที่มีการจัดการสินค้าผ่านระบบอัตโนมัติ การใช้หุ่นยนต์จัดเรียงสินค้า และระบบควบคุมอุณหภูมิอัตโนมัติ​
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
        <h1 className={styles.title2}> 9. Digital Twins​</h1>
        <p className={styles.description_1}>
        การสร้างโมเดลดิจิทัลจำลองของกระบวนการโลจิสติกส์หรือยานพาหนะ เพื่อทำการวิเคราะห์และทดสอบการทำงานในสภาพแวดล้อมเสมือน​
        </p>
      </div>
      {/* <img
        src="/image/Smart Water Management2.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
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

export default Smart_Logistics;
