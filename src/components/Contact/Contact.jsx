import React from "react";
import styles from "./Contact.module.css";

export const Contact = () => {
  const contactInfo = {
    address: {
      title: "Address",
      details: "44/44 Vibhavadi-Rangsit 60 Yake 18-1-2, Talad Bangkhen, Laksi, Bangkok 10210 ",
      symbol: "📍"
    },
    email: {
      title: "E-mail",
      details: "info@tkc-services.com",
      link: "mailto:info@tkc-services.com",
      symbol: "✉️"
    },
    phone: {
      title: "Telephone",
      details: "(+66) 0-2401-8222",
      link: "tel:+66024018222",
      symbol: "📞"
    },
    social: {
      title: "Social Media",
      details: "Facebook",
      link: "https://www.facebook.com/TurnkeyCommunicationServices",
      symbol: "👥"
    }
  };

  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.container}>
        <div className={styles.headerSection}>
          <h2 className={styles.title}>Contact Us</h2>
          <div className={styles.titleUnderline}></div>
        </div>

        <div className={styles.contactGrid}>
          {Object.entries(contactInfo).map(([key, info]) => (
            <div key={key} className={styles.contactCard}>
              <div className={styles.iconWrapper}>
                <span className={styles.symbol}>{info.symbol}</span>
              </div>
              <h3 className={styles.contactTitle}>{info.title}</h3>
              {info.link ? (
                <a 
                  href={info.link} 
                  className={styles.contactLink}
                  target={key === 'social' ? '_blank' : undefined}
                  rel={key === 'social' ? 'noopener noreferrer' : undefined}
                >
                  {info.details}
                </a>
              ) : (
                <p className={styles.contactText}>{info.details}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} TKC Services. All rights reserved.
        </p>
      </div>
    </footer>
  );
};