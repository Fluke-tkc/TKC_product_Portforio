import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Hero_New.module.css";
import { Contact } from "../Contact/Contact";
import { Features } from "../Allmodule/Features";
import { Team } from "../Allmodule/Team";
import { BlogPosts } from "../Allmodule/BlogPosts";
// import { Documentation } from "../Allmodule/Documentation";
export const Hero_New = () => {
  const navigate = useNavigate();

  // ฟังก์ชันสำหรับนำทางไปยังหน้า Smart Solutions
  const handleLearnMoreClick_smart_solutions = () => {
    navigate("/smart-solutions");
  };
  
  // ฟังก์ชันสำหรับนำทางไปยังหน้า Green Solutions
  const handleLearnMoreClick_green_solutions = () => {
    navigate("/green-solutions");
  };

  // ข้อมูลบริการต่างๆ
  const services = [
    {
      name: "Smart Solutions",
      description: "แนวทางหรือระบบที่ใช้เทคโนโลยีขั้นสูงและนวัตกรรมในการแก้ปัญหาหรือปรับปรุงกระบวนการต่างๆ",
      image: "/image/smartsolution2.png",
      link: "/smart-solutions"
    },
    {
      name: "Cloud Solution",
      description: "บริการระบบคลาวด์ที่ปรับแต่งตามความต้องการของธุรกิจคุณ",
      image: "/image/cloudsolution.jpg"
    },
    {
      name: "Cyber Security",
      description: "ปกป้องโครงสร้างพื้นฐานของคุณด้วยเทคโนโลยีความปลอดภัยล่าสุด",
      image: "/image/cybersecurity.jpg"
    }
    ,
    {
      name: "Cyber Security",
      description: "ปกป้องโครงสร้างพื้นฐานของคุณด้วยเทคโนโลยีความปลอดภัยล่าสุด",
      image: "/image/cybersecurity.jpg"
    }
    ,
    {
      name: "Cyber Security",
      description: "ปกป้องโครงสร้างพื้นฐานของคุณด้วยเทคโนโลยีความปลอดภัยล่าสุด",
      image: "/image/cybersecurity.jpg"
    }
    ,
    {
      name: "Cyber Security",
      description: "ปกป้องโครงสร้างพื้นฐานของคุณด้วยเทคโนโลยีความปลอดภัยล่าสุด",
      image: "/image/cybersecurity.jpg"
    }
    ,
    {
      name: "Cyber Security",
      description: "ปกป้องโครงสร้างพื้นฐานของคุณด้วยเทคโนโลยีความปลอดภัยล่าสุด",
      image: "/image/cybersecurity.jpg"
    }
    ,
    {
      name: "Cyber Security",
      description: "ปกป้องโครงสร้างพื้นฐานของคุณด้วยเทคโนโลยีความปลอดภัยล่าสุด",
      image: "/image/cybersecurity.jpg"
    }
    ,
    {
      name: "Cyber Security",
      description: "ปกป้องโครงสร้างพื้นฐานของคุณด้วยเทคโนโลยีความปลอดภัยล่าสุด",
      image: "/image/cybersecurity.jpg"
    }
    ,
    {
      name: "Cyber Security",
      description: "ปกป้องโครงสร้างพื้นฐานของคุณด้วยเทคโนโลยีความปลอดภัยล่าสุด",
      image: "/image/cybersecurity.jpg"
    }
    ,
    {
      name: "Cyber Security",
      description: "ปกป้องโครงสร้างพื้นฐานของคุณด้วยเทคโนโลยีความปลอดภัยล่าสุด",
      image: "/image/cybersecurity.jpg"
    }
  ];

  return (
    <>
      <div className={styles.heroBackground}>
        <div className={styles.heroContent}>
          <h1 className={styles.mainTitle}>
            บริษัท เทิร์นคีย์ คอมมูนิเคชั่น เซอร์วิส จำกัด (มหาชน)
          </h1>
          <div className={styles.description}>
            <p>
              มีความยินดีเป็นอย่างยิ่งที่จะนำเสนอผลงานและบริการที่เราได้พัฒนาขึ้นเพื่อสนับสนุนความสำเร็จของลูกค้าและพันธมิตรทางธุรกิจ 
              เรามุ่งมั่นในการนำเสนอโซลูชันที่ครบวงจรและตอบโจทย์การสื่อสารในยุคดิจิทัล
            </p>
            <p>
              ในทุกขั้นตอนของการทำงาน เราให้ความสำคัญกับนวัตกรรม คุณภาพ และความเชื่อมั่นที่ลูกค้าสามารถไว้วางใจได้
            </p>
          </div>
        </div>
      </div>

      <div className={styles.servicesSection}>
        <h2 className={styles.sectionTitle}>Our Services</h2>
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div 
              key={index}
              className={styles.serviceCard}
              onClick={() => service.link && navigate(service.link)}
              role={service.link ? "button" : undefined}
              tabIndex={service.link ? "0" : undefined}
            >
              <img src={service.image} alt={service.name} className={styles.serviceImage} />
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      <Features />
      <Team />
      <BlogPosts />
      {/* <Documentation /> */}
      <Contact />
    </>
  );
};