import React, { useEffect, useState } from 'react';
import styles from './SongkranEffect.module.css';

const SongkranEffect = () => {
  const [elements, setElements] = useState([]);

  const images = [
        // ขันน้ำ
    '/image/Water.png',     // น้ำ
    // '/image/songkran/water-gun.png',      // ปืนฉีดน้ำ
    // '/image/songkran/sand-castle.png',    // ปราสาททราย
    // '/image/songkran/temple.png',         // วัด
    // '/image/songkran/buddha.png',         // พระพุทธรูป
    // '/image/songkran/garland.png',        // พวงมาลัย
    // '/image/songkran/elephant.png'        // ช้าง
  ];

  useEffect(() => {
    const createElements = () => {
      // สร้าง 3-7 elements ต่อครั้ง
      const count = Math.floor(Math.random() * 4) + 2;
      const newElements = Array(count).fill(null).map(() => ({
        id: Math.random(),
        image: images[Math.floor(Math.random() * images.length)],
        style: {
          '--x': `${Math.random() * 100}%`,
          '--y': `${Math.random() * 100}%`,
          '--size': `${40 + Math.random() * 180}px`, // ขนาดใหญ่ขึ้นสำหรับรูปภาพ
          '--rotation': `${Math.random() * 360}deg`,
          '--duration': `${2 + Math.random() * 2}s`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        }
      }));

      setElements(prev => [...prev, ...newElements]);

      // ลบ elements หลังจากครบเวลา
      setTimeout(() => {
        setElements(prev => 
          prev.filter(el => !newElements.find(newEl => newEl.id === el.id))
        );
      }, 4000);
    };

    const interval = setInterval(createElements, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      {elements.map(element => (
        <div
          key={element.id}
          className={styles.element}
          style={element.style}
        >
          <img 
            src={element.image}
            alt="Songkran"
            className={styles.image}
          />
        </div>
      ))}
    </div>
  );
};


export default SongkranEffect;