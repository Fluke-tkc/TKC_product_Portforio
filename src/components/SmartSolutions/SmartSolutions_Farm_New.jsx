import React from 'react';
import { useNavigate } from "react-router-dom";
import styles from "./SmartSolutions_Farm_New.module.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { Contact } from "../Contact/Contact";
import { Navbar } from "../Navbar/Navbar";

export const SmartSolutions_Farm_New = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage, text } = useLanguage();


  const handleClose = () => {
   
    navigate("/");
  };
  return (
    <>
    
      <div className={styles.slider_section}>
      <div className={styles.Backhome_Header}>
       <button  className={styles.Backhome_Buttom} onClick={handleClose}>
      
        Back 
       
       </button>
       </div>
        <div className={styles.languageTabs}>
          
          <button 
            className={`${styles.languageTab} ${language === 'en' ? styles.active : ''}`}
            onClick={() => language !== 'en' && toggleLanguage()}
          >
            EN
          </button>
          <button 
            className={`${styles.languageTab} ${language === 'th' ? styles.active : ''}`}
            onClick={() => language !== 'th' && toggleLanguage()}
          >
            TH
          </button>
        </div>
        
        <div className={styles.banner}>
          <div className={styles.content}>
            <h1 data-content={text.commingsoon}>{text.commingsoon}</h1>
            <div className={styles.author}>
              <p>{text.subtitle}</p>
            </div>
            <br></br>
            
          </div>
       
        </div>
        
      </div>

    </>
  );
};

export default SmartSolutions_Farm_New;