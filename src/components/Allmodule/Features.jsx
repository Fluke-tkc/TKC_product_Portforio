import React from "react";
import styles from "./Features.module.css";

export const Features = () => {
  const features = [
    {
      icon: "🌐",
      title: "Fully integrated",
      description: "We get insulted by others, lose trust for those We get back freezes"
    },
    {
      icon: "💳",
      title: "Payments functionality",
      description: "We get insulted by others, lose trust for those We get back freezes"
    },
    {
      icon: "🔧",
      title: "Prebuilt components",
      description: "We get insulted by others, lose trust for those We get back freezes"
    },
    {
      icon: "⚡",
      title: "Improved platform",
      description: "We get insulted by others, lose trust for those We get back freezes"
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.iconWrapper}>
                  <span className={styles.icon}>{feature.icon}</span>
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.imageSection}>
            <div className={styles.cardContent}>
              <img 
                src="/api/placeholder/400/320"
                alt="Woman working"
                className={styles.featureImage}
              />
              <div className={styles.cardText}>
                <h2 className={styles.cardTitle}>Get Insights On Search</h2>
                <p className={styles.cardDescription}>
                  Website visitors today demand a frictionless user experience — especially when using search.
                  Because of the hight standards.
                </p>
                <button className={styles.cardButton}>FIND OUT MORE</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};