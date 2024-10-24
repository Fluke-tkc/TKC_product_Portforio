import React, { useEffect } from "react";
import styles from "./Smart_Organized_Communication_Cables.module.css";
import { Navbar } from "../../Navbar/Navbar";
import { Contact } from "../../Contact/Contact";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate

export const Smart_Organized_Communication_Cables = () => {
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
        <h1 className={styles.title}>Smart Organized Communication Cables</h1>
        <h1 className={styles.title2}> 1. Fiber Optic Cables​</h1>
        <p className={styles.description_1}>
        สายไฟเบอร์ออปติกเป็นส่วนสำคัญของโครงข่ายสื่อสารอัจฉริยะ 
        เนื่องจากสามารถส่งข้อมูลด้วยความเร็วสูงและมีความสามารถในการรองรับปริมาณข้อมูลมากกว่าสายทองแดงทั่วไป​
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

<section className={styles.container_2}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
      {/* <img
          src="/image/Energy Management System (EMS).jpg"
          alt="Me sitting with a laptop"
          className={styles.aboutImage}
        /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 2. Copper Cables (Coaxial/UTP) ​</h1>

        <p className={styles.description_1}>
        สายทองแดงประเภทต่างๆ เช่น Coaxial หรือ UTP (Unshielded Twisted Pair)
         ยังถูกใช้อยู่ในบางสถานการณ์ เช่น การสื่อสารระยะสั้นหรือในระบบที่ไม่ต้องการความเร็วสูงมาก​
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
        <h1 className={styles.title2}>3. Cable Management Systems​</h1>
        <p className={styles.description_1}>
        ระบบจัดการสายสื่อสาร เช่น cable trays, cable conduits, และ cable ties ที่ช่วยจัดระเบียบสายให้เป็นระบบ
         ลดความยุ่งเหยิงและลดโอกาสที่สายจะเสียหาย​
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

<section className={styles.container_2}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    {/* <img
        src="/image/Smart HVAC (Heating, Ventilation, and Air Conditioning).jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 4. Power over Ethernet (PoE)​</h1>

        <p className={styles.description_1}>
        เทคโนโลยีที่ช่วยให้สาย Ethernet สามารถส่งทั้งข้อมูลและพลังงานผ่านสายเดียวกัน 
        ทำให้ลดจำนวนสายที่ต้องใช้ในการติดตั้งอุปกรณ์ เช่น กล้องวงจรปิดหรือจุดเชื่อมต่อไร้สาย​
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
        <h1 className={styles.title2}> 5. Structured Cabling</h1>
        <p className={styles.description_1}>
        การออกแบบและติดตั้งสายเคเบิลอย่างเป็นระบบ โดยมีการจัดการที่เป็นมาตรฐาน เช่น การแยกสายตามประเภทของข้อมูล 
          (ข้อมูลเสียง วิดีโอ หรือข้อมูลทั่วไป) ทำให้การบำรุงรักษาและอัพเกรดระบบง่ายขึ้น​
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

<section className={styles.container_2}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    {/* <img
        src="/image/Security System1.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 6. Network Switches & Hubs​</h1>

        <p className={styles.description_1}>
        อุปกรณ์เครือข่าย เช่น switch และ hub ช่วยในการเชื่อมต่อสายสื่อสารเข้าด้วยกันและจัดการการส่งข้อมูลระหว่างอุปกรณ์ต่างๆ ภายในเครือข่าย​
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
    {/* <img
        src="/image/Security System1.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 7. Wireless Integration​</h1>

        <p className={styles.description_1}>
        แม้ว่าสายสื่อสารยังคงมีความสำคัญ ระบบไร้สายที่เชื่อมต่อกับสายเคเบิลก็เป็นอีกองค์ประกอบที่เสริมประสิทธิภาพ
         เช่น การใช้สายสื่อสารในการจัดการโครงข่ายไร้สายที่ครอบคลุมบริเวณกว้าง​​
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

<section className={styles.container_2}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
    {/* <img
        src="/image/Security System1.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 8. Smart Monitoring & Diagnostics</h1>

        <p className={styles.description_1}>
        ระบบตรวจสอบและวิเคราะห์การทำงานของสายสื่อสารแบบอัตโนมัติ ช่วยให้สามารถตรวจจับปัญหา เช่น
         การเสื่อมสภาพของสายหรือการเชื่อมต่อที่ผิดพลาดได้อย่างรวดเร็ว​
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
    {/* <img
        src="/image/Security System1.jpg"
        alt="Me sitting with a laptop"
        className={styles.aboutImage}
      /> */}
      <div className={styles.textContainer}>

        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 9. Redundancy and Backup Lines​</h1>

        <p className={styles.description_1}>
        การจัดการเครือข่ายที่มีสายสำรองในกรณีที่สายหลักเกิดปัญหา เพื่อให้การสื่อสารยังคงทำงานได้อย่างต่อเนื่อง​
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
<section className={styles.container_2}>
  <div className={styles.content}>
    <div className={styles.textAndImageWrapper}>
      <div className={styles.textContainer}>  
        <h1 className={styles.title}></h1>
        <h1 className={styles.title2}> 10. Shielded Cables (STP/FTP)​</h1>
        <p className={styles.description_1}>
        สายเคเบิลที่มีการหุ้มป้องกันการรบกวนจากสัญญาณแม่เหล็กไฟฟ้า ช่วยลดปัญหาการสูญเสียข้อมูลในระหว่างการส่งข้อมูล​
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

export default Smart_Organized_Communication_Cables;
