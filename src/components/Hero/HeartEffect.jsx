import React, { useEffect } from 'react';
import styles_H from './Hearteffect.module.css';

const HeartEffect = () => {
  useEffect(() => {
    const valentineContainer = document.getElementById('valentineContainer');

    if (!valentineContainer) {
      
      return;
    }

    const createheart = () => {
      const heart = document.createElement('div');
      heart.classList.add(styles_H.heart);
      heart.style.left = Math.random() * 100 + 'vw'; // สุ่มตำแหน่งเริ่มต้นแนวนอน
      heart.style.width = `${Math.random() * 20 + 10}px`; // สุ่มขนาดหิมะ
      heart.style.height = heart.style.width; // ให้ขนาดกว้างเท่ากับสูง
      heart.style.animationDuration = `${Math.random() * 30 + 10}s`; // สุ่มระยะเวลาอนิเมชัน
      heart.style.opacity = Math.random(); // สุ่มความโปร่งใส
  // สุ่มระยะเวลาอนิเมชันหมุน
      
      heart.style.animation = `${styles_H.heartfall} ${heart.style.animationDuration} linear infinite`;
      // สุ่มค่าความเบลอ
      const blurAmount = Math.random() *  (3 - 2) + 2; // ระดับเบลอระหว่าง 0px - 3px
      heart.style.filter = `blur(${blurAmount}px)`;
      valentineContainer.appendChild(heart);

      // ลบหิมะเมื่อจบอนิเมชัน
      setTimeout(() => heart.remove(), parseFloat(heart.style.animationDuration) * 1000);
    };

    // สร้างหิมะทุกๆ 100ms
    const heartInterval = setInterval(createheart, 100);

    // ทำความสะอาด interval เมื่อ component ถูกลบ
    return () => clearInterval(heartInterval);
  }, []);

  return <div id="valentineContainer" className={styles_H.valentineContainer}></div>;
};

export default HeartEffect;
