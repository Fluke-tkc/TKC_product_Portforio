import React from "react";
import styles from "./BlogPosts.module.css";

export const BlogPosts = () => {
  const posts = [
    {
      title: "Rover raised $65 million",
      description: "Finding temporary housing for your dog should be as easy as renting an Airbnb. That's the idea behind Rover...",
      image: "/image/blog/rover.jpg",
      link: "#"
    },
    {
      title: "MateLabs machine learning",
      description: "If you've ever wanted to train a machine learning model and integrate it with IFTTT, you now can with...",
      image: "/image/blog/matelabs1.jpg",
      link: "#"
    },
    {
      title: "MateLabs machine learning",
      description: "If you've ever wanted to train a machine learning model and integrate it with IFTTT, you now can with...",
      image: "/image/blog/matelabs2.jpg",
      link: "#"
    },
    {
        title: "MateLabs machine learning",
        description: "If you've ever wanted to train a machine learning model and integrate it with IFTTT, you now can with...",
        image: "/image/blog/matelabs2.jpg",
        link: "#"
      },
    {
      title: "Flexible work hours",
      description: "Rather than worrying about switching offices every couple years, you stay in the same place.",
      image: "/image/blog/flexible.jpg",
      isFeature: true,
      link: "#"
    }
    
  ];

  return (
    <section className={styles.blogSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Check my latest blogposts</h2>
        
        <div className={styles.blogGrid}>
          {posts.map((post, index) => (
            <article 
              key={index} 
              className={`${styles.blogCard} ${post.isFeature ? styles.featureCard : ''}`}
            >
              <div className={styles.imageContainer}>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className={styles.blogImage} 
                />
              </div>
              <div className={styles.contentContainer}>
                <h3 className={styles.blogTitle}>{post.title}</h3>
                <p className={styles.blogDescription}>{post.description}</p>
                <a href={post.link} className={styles.readMore}>
                  Read More {post.isFeature ? '→' : '➔'}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};