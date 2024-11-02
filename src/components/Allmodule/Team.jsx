import React from "react";
import styles from "./Team.module.css";

export const Team = () => {
  const teamMembers = [
    {
      name: "Emma Roberts",
      position: "UI Designer",
      description: "Artist is a term applied to a person who engages in an activity deemed to be an art.",
      image: "/image/team/emma.jpg",
      textColor: "text-[#1976D2]"
    },
    {
      name: "William Pearce",
      position: "Boss",
      description: "Artist is a term applied to a person who engages in an activity deemed to be an art.",
      image: "/image/team/william.jpg",
      textColor: "text-[#1976D2]"
    },
    {
      name: "Ivana Flow",
      position: "Athlete",
      description: "Artist is a term applied to a person who engages in an activity deemed to be an art.",
      image: "/image/team/ivana.jpg",
      textColor: "text-[#1976D2]"
    },
    {
      name: "Marquez Garcia",
      position: "JS Developer",
      description: "Artist is a term applied to a person who engages in an activity deemed to be an art.",
      image: "/image/team/marquez.jpg",
      textColor: "text-[#1976D2]"
    }
  ];

  return (
    <section className={styles.teamSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>The Executive Team</h2>
          <p className={styles.subtitle}>
            There's nothing I really wanted to do in life that I wasn't able to get good at. That's my skill.
          </p>
        </div>

        <div className={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <div key={index} className={styles.memberCard}>
              <div className={styles.cardContent}>
                <div className={styles.imageWrapper}>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className={styles.memberImage}
                  />
                </div>
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>{member.name}</h3>
                  <p className={styles.memberPosition}>{member.position}</p>
                  <p className={styles.memberDescription}>{member.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};