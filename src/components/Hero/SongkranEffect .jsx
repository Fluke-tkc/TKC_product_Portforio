import React, { useEffect, useState, useCallback } from 'react';
import styles from './SongkranEffect.module.css';

const SongkranEffect = () => {
  const [elements, setElements] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // รายการรูปภาพสงกรานต์
  const images = [
    '/image/Water.png',
  
  ];

  // คำนวณขนาดตามหน้าจอ
  const calculateSize = useCallback(() => {
    if (windowWidth <= 480) {
      return 20 + Math.random() * 30; // ขนาดสำหรับมือถือเล็ก
    } else if (windowWidth <= 768) {
      return 30 + Math.random() * 40; // ขนาดสำหรับแท็บเล็ต
    } else {
      return 40 + Math.random() * 60; // ขนาดสำหรับเดสก์ท็อป
    }
  }, [windowWidth]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const createElements = () => {
      const count = Math.floor(Math.random() * 5) + 3;
      const newElements = Array(count).fill(null).map(() => ({
        id: Math.random(),
        image: images[Math.floor(Math.random() * images.length)],
        style: {
          '--size': `${calculateSize()*2}px`,
          '--rotation': `${Math.random() * 360}deg`,
          '--duration': `${2 + Math.random() * 2}s`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        }
      }));

      setElements(prev => [...prev, ...newElements]);

      setTimeout(() => {
        setElements(prev => 
          prev.filter(el => !newElements.find(newEl => newEl.id === el.id))
        );
      }, 4000);
    };

    const interval = setInterval(createElements, 1000);
    return () => clearInterval(interval);
  }, [calculateSize]);

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