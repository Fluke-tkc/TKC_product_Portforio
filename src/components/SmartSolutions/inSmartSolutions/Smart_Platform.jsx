import React from "react";
import styles from "./Smart_Platform.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate

export const Smart_Platform = () => {
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
        <h1 className={styles.title}>Smart Platform</h1>
        <h1 className={styles.title2}> 1. Internet of Things (IoT)​</h1>
        <p className={styles.description_1}>
        การเชื่อมต่ออุปกรณ์ต่างๆ ผ่านอินเทอร์เน็ตเพื่อแลกเปลี่ยนข้อมูลและควบคุมการทำงานของอุปกรณ์จากระยะไกล 
        เช่น ระบบบ้านอัจฉริยะ การควบคุมเครื่องใช้ไฟฟ้า เป็นต้น​​
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
        <h1 className={styles.title2}> 2. Artificial Intelligence (AI) ​</h1>

        <p className={styles.description_1}>
        การใช้ปัญญาประดิษฐ์ในการวิเคราะห์ข้อมูล การเรียนรู้พฤติกรรมผู้ใช้ 
        และปรับปรุงการทำงานของระบบให้ฉลาดและตอบสนองต่อความต้องการของผู้ใช้งานมากขึ้น​
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
        <h1 className={styles.title2}>3. Cloud Computing​</h1>
        <p className={styles.description_1}>
        การเก็บและประมวลผลข้อมูลบนระบบคลาวด์ ทำให้สามารถเข้าถึงข้อมูลจากที่ใดก็ได้และเพิ่มความยืดหยุ่นในการจัดการทรัพยากร​
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
        <h1 className={styles.title2}> 4. Big Data Analytics​</h1>

        <p className={styles.description_1}>
        การวิเคราะห์ข้อมูลขนาดใหญ่เพื่อให้ได้ข้อมูลเชิงลึกและช่วยในการตัดสินใจอย่างมีประสิทธิภาพ​
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
        <h1 className={styles.title2}> 5. Automation</h1>
        <p className={styles.description_1}>
        ระบบที่ช่วยให้กระบวนการทำงานเป็นอัตโนมัติ ลดการใช้แรงงานคนและเพิ่มความแม่นยำและรวดเร็วในการทำงาน เช่น
         ระบบหุ่นยนต์ หรือระบบการจัดการทรัพยากรอัตโนมัติ​
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
        <h1 className={styles.title2}> 6. Cybersecurity​</h1>

        <p className={styles.description_1}>
        มาตรการความปลอดภัยในการปกป้องข้อมูลและระบบจากการโจมตีทางไซเบอร์ เพื่อให้การทำงานของแพลตฟอร์มเป็นไปอย่างปลอดภัย
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
        <h1 className={styles.title2}> 7. User Interface (UI) และ User Experience (UX)​</h1>

        <p className={styles.description_1}>
        การออกแบบอินเทอร์เฟซและประสบการณ์ผู้ใช้งานที่ตอบสนองความต้องการและง่ายต่อการใช้งาน 
        ทำให้ผู้ใช้สามารถทำงานกับแพลตฟอร์มได้อย่างสะดวกและมีประสิทธิภาพ​
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

export default Smart_Platform;
