import React, { useEffect } from 'react';
import styles from './snowEffect.module.css';

const SnowEffect = () => {
  useEffect(() => {
    const snowContainer = document.getElementById('snowContainer');

    if (!snowContainer) {
      console.error('Snow container not found');
      return;
    }

    const createSnow = () => {
      const snow = document.createElement('div');
      snow.classList.add(styles.snow);
      snow.style.left = Math.random() * 100 + 'vw'; // สุ่มตำแหน่งเริ่มต้นแนวนอน
      snow.style.width = `${Math.random() * 20 + 10}px`; // สุ่มขนาดหิมะ
      snow.style.height = snow.style.width; // ให้ขนาดกว้างเท่ากับสูง
      snow.style.animationDuration = `${Math.random() * 30 + 10}s`; // สุ่มระยะเวลาอนิเมชัน
      snow.style.opacity = Math.random(); // สุ่มความโปร่งใส
  // สุ่มระยะเวลาอนิเมชันหมุน
      
      snow.style.animation = `${styles.snowfall} ${snow.style.animationDuration} linear infinite`;
      // สุ่มค่าความเบลอ
      const blurAmount = Math.random() *  (3 - 2) + 2; // ระดับเบลอระหว่าง 0px - 3px
      snow.style.filter = `blur(${blurAmount}px)`;
      snowContainer.appendChild(snow);

      // ลบหิมะเมื่อจบอนิเมชัน
      setTimeout(() => snow.remove(), parseFloat(snow.style.animationDuration) * 1000);
    };

    // สร้างหิมะทุกๆ 100ms
    const snowInterval = setInterval(createSnow, 100);

    // ทำความสะอาด interval เมื่อ component ถูกลบ
    return () => clearInterval(snowInterval);
  }, []);

  return <div id="snowContainer" className={styles.snowContainer}></div>;
};

export default SnowEffect;
