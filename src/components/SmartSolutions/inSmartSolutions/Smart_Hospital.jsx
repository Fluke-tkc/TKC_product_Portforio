import React from "react";
import styles from "./Smart_Hospital.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate

export const Smart_Hospital = () => {
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
        <h1 className={styles.title}>Smart Hospital</h1>
        <h1 className={styles.title2}> 1. Internet of Things (IoT)</h1>
        <p className={styles.description_1}>
        อุปกรณ์และเซนเซอร์ต่าง ๆ ที่ใช้ในการตรวจวัดสัญญาณชีพของผู้ป่วยแบบเรียลไทม์ เช่น เครื่องวัดความดันโลหิต
         เครื่องตรวจคลื่นหัวใจ หรืออุปกรณ์ติดตามการเคลื่อนไหว ซึ่งจะส่งข้อมูลไปยังแพทย์หรือพยาบาลทันทีหากเกิดเหตุผิดปกติ​
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
        <h1 className={styles.title2}>  2. Artificial Intelligence (AI)</h1>

        <p className={styles.description_1}>
        ใช้ในการวิเคราะห์ข้อมูลผู้ป่วยเพื่อช่วยวินิจฉัยโรค การทำนายความเสี่ยงของโรค หรือแนะนำแนวทางการรักษา AI
         ยังสามารถใช้ในการวิเคราะห์ภาพทางการแพทย์ เช่น การตรวจเอกซเรย์หรือ MRI​
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
        <h1 className={styles.title2}> 3. Robotics</h1>
        <p className={styles.description_1}>
        หุ่นยนต์ที่ใช้ในงานทางการแพทย์ เช่น หุ่นยนต์ช่วยผ่าตัด หุ่นยนต์จัดส่งยา หรือหุ่นยนต์ทำความสะอาดในโรงพยาบาล
         ซึ่งช่วยลดภาระงานและเพิ่มความปลอดภัย
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
        <h1 className={styles.title2}> 4. Telemedicine</h1>

        <p className={styles.description_1}>
        การให้คำปรึกษาทางการแพทย์ผ่านระบบออนไลน์ ทำให้แพทย์สามารถดูแลผู้ป่วยจากระยะไกล
         โดยเฉพาะในกรณีที่ผู้ป่วยอยู่ในพื้นที่ห่างไกล​
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
        <h1 className={styles.title2}> 5. Electronic Health Records (EHR)</h1>
        <p className={styles.description_1}>
        ระบบจัดเก็บข้อมูลทางการแพทย์ของผู้ป่วยแบบดิจิทัล ทำให้สามารถเข้าถึงข้อมูลได้รวดเร็ว ลดความซ้ำซ้อนในการตรวจวินิจฉัย
         และช่วยในการตัดสินใจทางการแพทย์ได้ดีขึ้น​
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
        <h1 className={styles.title2}> 6. Wearable Devices</h1>

        <p className={styles.description_1}>
        อุปกรณ์สวมใส่ที่ช่วยติดตามสุขภาพของผู้ป่วย เช่น สมาร์ทวอทช์ที่ตรวจวัดอัตราการเต้นของหัวใจ ระดับออกซิเจนในเลือด หรือจำนวนก้าวเดิน​
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
        <h1 className={styles.title2}> 7. Smart Beds</h1>
        <p className={styles.description_1}>
        เตียงอัจฉริยะที่สามารถปรับตัวเองตามท่าทางของผู้ป่วยเพื่อลดการเกิดแผลกดทับ หรือติดตั้งเซ็นเซอร์เพื่อติดตามการเคลื่อนไหวและสัญญาณชีพ​
        </p>
      </div>
      {/* <img
        src="/image/Smart Water Management2.jpg"
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
        src="/image/Predictive Maintenance.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}>  8. Pharmacy Automation</h1>

        <p className={styles.description_1}>
        ระบบอัตโนมัติในการจัดยา จ่ายยา และควบคุมสต็อกยาภายในโรงพยาบาล ช่วยลดความผิดพลาดในการจัดยาหรือจ่ายยาให้กับผู้ป่วย​
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
        <h1 className={styles.title2}> 9. Mobile Health (mHealth)</h1>
        <p className={styles.description_1}>
        การใช้แอปพลิเคชันบนสมาร์ทโฟนในการติดตามสุขภาพของผู้ป่วย เช่น การตรวจติดตามระดับน้ำตาลในเลือด 
        การวางแผนการออกกำลังกาย หรือการแจ้งเตือนเวลาทานยา​
        </p>
      </div>
      {/* <img
        src="/image/Smart Metering1.jpg"
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
        src="/image/Renewable Energy Integration1.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}>  10. Blockchain</h1>

        <p className={styles.description_1}>
        ใช้เพื่อเพิ่มความปลอดภัยและความโปร่งใสในการจัดเก็บข้อมูลทางการแพทย์ ทำให้ข้อมูลสามารถตรวจสอบได้และป้องกันการปลอมแปลง​
        ใช้สำหรับจัดเก็บและประมวลผลข้อมูลขนาดใหญ่ในโรงพยาบาล ทำให้ข้อมูลทางการแพทย์สามารถเข้าถึงได้จากทุกที่โดยปลอดภัย
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
        <h1 className={styles.title2}> 11. Augmented Reality (AR) และ Virtual Reality (VR)</h1>
        <p className={styles.description_1}>
        ใช้ในการฝึกอบรมแพทย์หรือการจำลองสถานการณ์ทางการแพทย์ เช่น การฝึกผ่าตัด การฝึกปฏิบัติการดูแลผู้ป่วย หรือการบำบัดรักษาผู้ป่วยทางจิต​
        </p>
      </div>
      {/* <img
        src="/image/Data Analytics1.jpg"
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

export default Smart_Hospital;
