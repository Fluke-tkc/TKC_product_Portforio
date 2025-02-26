import React, { useEffect, useState, useCallback } from 'react';
import styles from './SongkranEffect.module.css';

const SongkranEffect = () => {
  
    const [bubbles, setBubbles] = useState([]);
  
    useEffect(() => {
      const createBubble = () => {
        const id = Math.random().toString(36).substr(2, 9);
        const newBubble = {
          id,
          size: Math.random() * 20 + 10, // 10px - 30px
          left: Math.random() * 100 + '%',
          duration: Math.random() * 3 + 2 // 2s - 5s
        };
        setBubbles(prev => [...prev, newBubble]);
        setTimeout(() => {
          setBubbles(prev => prev.filter(bubble => bubble.id !== id));
        }, (newBubble.duration + 1) * 1000);
      };
  
      const interval = setInterval(createBubble, 500);
      return () => clearInterval(interval);
    }, []);
  
  return (
    <div className={styles.bubbleContainer}>
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className={styles.bubble}
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.left,
            animationDuration: `${bubble.duration}s`
          }}
        />
      ))}
      <img
          className={styles.eventImage}
          src="/image/Event.png"
          alt="Event"
          loading="eager"
          decoding="async"
        />
    </div>
      

        
  );
};

export default SongkranEffect;