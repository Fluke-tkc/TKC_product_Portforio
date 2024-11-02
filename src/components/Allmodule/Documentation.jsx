import React from "react";
import styles from "./Documentation.module.css";

export const Documentation = () => {
  const features = [
    {
      icon: "🚀",
      title: "Getting Started",
      description: "Check the possible ways of working with our product and the necessary files for building your own project.",
      link: "#",
      linkText: "Let's start",
      variant: "dark"
    },
    {
      icon: "🔌",
      title: "Plugins",
      description: "Get inspiration and have an overview about the plugins that we used to create the Material Kit.",
      link: "#",
      linkText: "Read more",
      variant: "light"
    },
    {
      icon: "🛠️",
      title: "Utility Classes",
      description: "Material Kit is giving you a lot of pre-made elements. For those who want flexibility, we included many utility classes.",
      link: "#",
      linkText: "Read more",
      variant: "light"
    }
  ];

  return (
    <section className={styles.docSection}>
      <div className={styles.heroArea}>
        <div className={styles.container}>
          <span className={styles.subtitle}>Built by developers</span>
          <h1 className={styles.title}>Complex Documentation</h1>
          <p className={styles.description}>
            From colors, cards, typography to complex elements, you will find
            the full documentation. Play with the utility classes and you will
            create unlimited combinations for our components.
          </p>
          <a href="#" className={styles.heroButton}>
            Read docs →
          </a>
        </div>
        <div className={styles.overlay}></div>
      </div>

      <div className={styles.featuresContainer}>
        <div className={styles.featureGrid}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`${styles.featureCard} ${feature.variant === 'dark' ? styles.darkCard : styles.lightCard}`}
            >
              <span className={styles.featureIcon}>{feature.icon}</span>
              <h2 className={styles.featureTitle}>{feature.title}</h2>
              <p className={styles.featureDescription}>{feature.description}</p>
              <a href={feature.link} className={styles.featureLink}>
                {feature.linkText} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};