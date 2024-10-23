import React from "react";
import styles from "./Smart_Learning.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate

export const Smart_Learning = () => {
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
        <h1 className={styles.title}>Smart Learning</h1>
        <h1 className={styles.title2}> 1. การใช้เทคโนโลยีขั้นสูง (Advanced Technology)​</h1>
        <p className={styles.description_1}>
        - การใช้อุปกรณ์เทคโนโลยี เช่น แท็บเล็ต สมาร์ทโฟน คอมพิวเตอร์ เพื่อเข้าถึงเนื้อหาการเรียนรู้​
        <br></br>
        - ระบบปัญญาประดิษฐ์ (AI) ที่ช่วยวิเคราะห์และปรับแต่งเนื้อหาตามความต้องการของผู้เรียน​
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
        <h1 className={styles.title2}> 2. การเรียนรู้ที่ยืดหยุ่น (Flexible Learning)​</h1>

        <p className={styles.description_1}>
        - การเรียนการสอนสามารถเกิดขึ้นได้ทุกที่ทุกเวลา ไม่จำกัดเฉพาะในห้องเรียน​
        <br></br>
        - มีการเรียนแบบออนไลน์หรือผสมผสานระหว่างการเรียนในห้องเรียนและการเรียนออนไลน์ (Blended Learning)​
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
        <h1 className={styles.title2}> 3. การปรับเนื้อหาการเรียนรู้ตามผู้เรียน (Personalized Learning)​</h1>
        <p className={styles.description_1}>
        - ระบบสามารถวิเคราะห์ข้อมูลของผู้เรียนและปรับเนื้อหาการเรียนรู้ให้เหมาะสมกับความสนใจ ความรู้ความสามารถ 
          หรือการตอบสนองต่อการเรียนรู้ของแต่ละบุคคล​
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
        <h1 className={styles.title2}> 4. การใช้ข้อมูลและการวิเคราะห์ (Data-Driven Learning)​</h1>

        <p className={styles.description_1}>
        - การใช้ข้อมูลในการติดตามพัฒนาการของผู้เรียน วิเคราะห์พฤติกรรมการเรียนรู้ และปรับวิธีการสอนหรือเนื้อหาที่เหมาะสม​
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
        <h1 className={styles.title2}> 5. การเรียนรู้ที่เน้นประสบการณ์ (Experiential Learning)</h1>
        <p className={styles.description_1}>
        - ใช้เครื่องมือที่ช่วยให้ผู้เรียนมีประสบการณ์จริง เช่น การใช้ VR/AR ในการจำลองสถานการณ์การเรียนรู้​
        <br></br>
        - การเรียนรู้ผ่านกิจกรรมหรือการฝึกปฏิบัติจริง​ 
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
        <h1 className={styles.title2}> 6. การมีส่วนร่วมและความร่วมมือ (Collaborative Learning)​</h1>

        <p className={styles.description_1}>
        - การสร้างสังคมการเรียนรู้ที่ผู้เรียนสามารถทำงานร่วมกัน พูดคุย แลกเปลี่ยนความรู้กับผู้เรียนคนอื่นได้ผ่านแพลตฟอร์มดิจิทัล​
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
        <h1 className={styles.title2}> 7. ระบบเรียนรู้อัตโนมัติ (Automated Learning Systems)​</h1>
        <p className={styles.description_1}>
        - ใช้ระบบอัตโนมัติในการตรวจสอบและประเมินผลการเรียนรู้ เช่น ระบบการประเมินผลอัตโนมัติ การแจ้งเตือนเนื้อหาการเรียนรู้เพิ่มเติม​
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

export default Smart_Learning;
