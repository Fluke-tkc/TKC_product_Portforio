import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Hero.module.css";
import {Navbar} from "../Navbar/Navbar"; 
import { Contact } from "../Contact/Contact";
export const Hero = () => {
  const navigate = useNavigate();

  const topics = [
    { name: "Smart Solutions", imgSrc: "/image/smartsolution.jpg" },
    { name: "Cloud Solution", imgSrc: "/image/cloudsolution.jpg" },
    { name: "Cyber Security", imgSrc: "/image/cybersecurity.jpg" },
    { name: "Software Development", imgSrc: "/image/softwaredevelopment.jpg" },
    { name: "Green Solution", imgSrc: "/image/greensolution.jpg" },
    { name: "Autonomous System", imgSrc: "/image/Autonomous-System.jpg" },
    { name: "Telecom and Network Infrastructure", imgSrc: "/image/Telecom-and-Network-Infrastructure.jpg" },
    { name: "ICT Infrastructure", imgSrc: "/image/ICTInfrastructure.jpg" },
    { name: "Public Safety", imgSrc: "/image/public-safety.jpg" },
    { name: "Logistics", imgSrc: "/image/Logistics.jpg" },
    { name: "Edutech", imgSrc: "/image/Edutech.jpg" },
    
    
   
  ];

  const handleLearnMoreClick_smart_solutions = () => {
    navigate("/smart-solutions");
  };
  return (
    <>
      <Navbar />
      <div className={styles.BG1}>
        <div className={styles.topic1}>Become a leading customer company in your industry.</div>
        <div className={styles.topic1}>company in your industry.</div>
        <div className={styles.topic2}>Our solutions are created with industry experts to help you modernize your.</div>
        <div className={styles.topic2}>business, save time, lower costs, and come together around your customers.</div>
        <div className={styles.buttonContainer}>
         <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
     </div>
      </div>
      

    

    
<div className={styles.productShowcase}>
  <div className={styles.showcaseContent}>
    <div className={styles.imageContainer2}>
      <img src="/image/cybersecurity.jpg" alt="Automotive Dashboard" />
    </div>
    <div className={styles.textContainer}>
      <h2>Automotive Cloud</h2>
      <p>
        See your driver’s information in one place. Dive into purchase and service histories,
        check open leases and warranties, and even manage in-vehicle features and subscriptions.
        Now you can surprise and delight at every touchpoint with an AI CRM for automotive.
      </p>
      <div className={styles.buttons}>
        <a href="#learn-more" className={styles.primaryButton}>Learn more</a>
        <a href="#try-for-free" className={styles.secondaryButton}>Try for free</a>
      </div>
    </div>
  </div>
</div>


<div className={styles.solutionSection}>
  <h2 className={styles.sectionTitle}>Our Services</h2>
  <div className={styles.threeColumnSolutions}>
    <div className={styles.solutionCard}>
      <img src="/image/smartsolution.jpg" className={styles.solutionImage} />
      <h3>Smart Solutions</h3>
      <p>Unleash the power of artificial intelligence to make sense of your data and drive decision-making.</p>
      <div className={styles.buttonContainerOurservice}>
      <a href="#learn-more" className={styles.primaryButtonTop}onClick={handleLearnMoreClick_smart_solutions} >Learn more</a>
        
      </div>
    </div>

    <div className={styles.solutionCard}>
      <img src="/image/cloudsolution.jpg"  className={styles.solutionImage} />
      <h3>Cloud Solution</h3>
      <p>Protect your infrastructure with the latest in cybersecurity technology, ensuring your data stays safe.</p>
      <div className={styles.buttonContainerOurservice}>
        <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
      </div>
    </div>

    <div className={styles.solutionCard}>
      <img src="/image/cybersecurity.jpg"  className={styles.solutionImage} />
      <h3>Cybersecurity Solutions</h3>
      <p>Transform your business with cloud solutions tailored to your unique needs.</p>
      <div className={styles.buttonContainerOurservice}>
        <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
      </div>
    </div>
  </div>


  <div className={styles.threeColumnSolutions}>
  <div className={styles.solutionCard}>
    <img src="/image/softwaredevelopment.jpg"  className={styles.solutionImage} />
    <h3>Software Development</h3>
    <p>Unleash the power of artificial intelligence to make sense of your data and drive decision-making.</p>
    <div className={styles.buttonContainerOurservice}>
    <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
    </div>
  </div>
  
  <div className={styles.solutionCard}>
    <img src="/image/greensolution.jpg"  className={styles.solutionImage} />
    <h3>Green Solution</h3>
    <p>Protect your infrastructure with the latest in cybersecurity technology, ensuring your data stays safe.</p>
    <div className={styles.buttonContainerOurservice}>
    <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
    </div>
  </div>
  <div className={styles.solutionCard}>
    <img src="/image/Autonomous-System.jpg" className={styles.solutionImage} />
    <h3>Autonomous System</h3>
    <p>Transform your business with cloud solutions tailored to your unique needs.</p>
    <div className={styles.buttonContainerOurservice}>
    <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
    </div>
  </div>
  
   </div>

   <div className={styles.threeColumnSolutions}>
  <div className={styles.solutionCard}>
    <img src="/image/Telecom-and-Network-Infrastructure.jpg"  className={styles.solutionImage} />
    <h3>Telecom and Network Infrastructure</h3>
    <p>Unleash the power of artificial intelligence to make sense of your data and drive decision-making.</p>
    <div className={styles.buttonContainerOurservice}>
    <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
    </div>
  </div>
  
  <div className={styles.solutionCard}>
    <img src="/image/ICTInfrastructure.jpg"  className={styles.solutionImage} />
    <h3>ICT Infrastructure</h3>
    <p>Protect your infrastructure with the latest in cybersecurity technology, ensuring your data stays safe.</p>
    <div className={styles.buttonContainerOurservice}>
    <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
    </div>
  </div>
  <div className={styles.solutionCard}>
    <img src="/image/public-safety.jpg" className={styles.solutionImage} />
    <h3>Public Safety</h3>
    <p>Transform your business with cloud solutions tailored to your unique needs.</p>
    <div className={styles.buttonContainerOurservice}>
    <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
    </div>
  </div>
  
   </div>
   <div className={styles.threeColumnSolutions}>
  <div className={styles.solutionCard}>
    <img src="/image/Logistics.jpg"  className={styles.solutionImage} />
    <h3>Logistics</h3>
    <p>Unleash the power of artificial intelligence to make sense of your data and drive decision-making.</p>
    <div className={styles.buttonContainerOurservice}>
    <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
    </div>
  </div>
  
  <div className={styles.solutionCard}>
    <img src="/image/Edutech.jpg"  className={styles.solutionImage} />
    <h3>Edutech</h3>
    <p>Protect your infrastructure with the latest in cybersecurity technology, ensuring your data stays safe.</p>
    <div className={styles.buttonContainerOurservice}>
    <a href="#learn-more" className={styles.primaryButtonTop}>Learn more</a>
    </div>
  </div>
 
  
   </div>
</div>





     
      {/* <div className={styles.BG3}>
        <div className={styles.topic3}>Our Service</div>
        <section className={styles.container}>
          <div className={styles.gridContainer}>
            {topics.map((topic, index) => (
              <div key={index} className={`${styles.circleWrapper} ${styles[`circle${index + 1}`]}`}>
                <button className={styles.circleButton} onClick={() => handleButtonClick(topic)}>
                  <img src={topic.imgSrc} alt={topic.name} />
                  <span>{topic.name}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div> */}
      <Contact />
    </>
  );
};
  