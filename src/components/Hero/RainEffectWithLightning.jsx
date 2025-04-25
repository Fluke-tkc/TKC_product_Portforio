import React, { useEffect, useRef, useState } from 'react';
import styles from './RainEffectWithLightning.module.css';

const RainEffectWithLightning = ({ intensity = 'medium' }) => {
  const canvasRef = useRef(null);
  const raindropsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [isLightning, setIsLightning] = useState(false);
  
  // Settings based on intensity
  const getSettings = (intensity) => {
    const settings = {
      low: {
        dropCount: 100,
        speedFactor: 0.4,
        dropSize: { min: 1, max: 3 },
        lightningFrequency: 9000, // Higher number = less frequent
        lightningDuration: [150, 350] // Range of duration in ms
      },
      medium: {
        dropCount: 200,
        speedFactor: 1,
        dropSize: { min: 1, max: 4 },
        lightningFrequency: 6000,
        lightningDuration: [50, 200]
      },
      high: {
        dropCount: 300,
        speedFactor: 1.3,
        dropSize: { min: 1, max: 5 },
        lightningFrequency: 4000,
        lightningDuration: [100, 250]
      }
    };
    
    return settings[intensity] || settings.medium;
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const settings = getSettings(intensity);
    let raindrops = [];
    let lightningTimeout;
    
    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initRaindrops();
    };
    
    // Initialize raindrops
    const initRaindrops = () => {
      raindrops = [];
      for (let i = 0; i < settings.dropCount; i++) {
        raindrops.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          length: Math.random() * 20 + 10,
          speed: (Math.random() * 10 + 10) * settings.speedFactor,
          thickness: Math.random() * (settings.dropSize.max - settings.dropSize.min) + settings.dropSize.min,
          opacity: Math.random() * 0.6 + 0.3
        });
      }
      raindropsRef.current = raindrops;
    };
    
    // Draw raindrops
    const drawRaindrops = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#8899AA';
      ctx.lineCap = 'round';
      
      for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];
        
        ctx.beginPath();
        ctx.lineWidth = drop.thickness;
        ctx.globalAlpha = drop.opacity;
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
        
        // Move raindrop
        drop.y += drop.speed;
        
        // Reset if raindrop goes off screen
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      }
    };
    
    // Lightning effect function
    const triggerLightning = () => {
      // Random timing for next lightning
      const randomDelay = Math.random() * settings.lightningFrequency + 2000;
      
      // Random duration for this lightning
      const minDuration = settings.lightningDuration[0];
      const maxDuration = settings.lightningDuration[1];
      const duration = Math.random() * (maxDuration - minDuration) + minDuration;
      
      // 30% chance of double flash
      const isDoubleFlash = Math.random() < 0.3;
      
      // Show lightning
      setIsLightning(true);
      
      // If double flash, hide briefly then show again
      if (isDoubleFlash) {
        setTimeout(() => {
          setIsLightning(false);
          
          // Brief pause before second flash
          setTimeout(() => {
            setIsLightning(true);
            
            // Hide after second flash duration
            setTimeout(() => {
              setIsLightning(false);
              
              // Schedule next lightning
              lightningTimeout = setTimeout(triggerLightning, randomDelay);
            }, duration * 0.5); // Second flash is usually shorter
          }, 50 + Math.random() * 100); // Random gap between flashes
        }, duration);
      } else {
        // Single flash - hide after duration
        setTimeout(() => {
          setIsLightning(false);
          
          // Schedule next lightning
          lightningTimeout = setTimeout(triggerLightning, randomDelay);
        }, duration);
      }
    };
    
    // Animation loop
    const animate = () => {
      drawRaindrops();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Initialize canvas and start animation
    handleResize();
    window.addEventListener('resize', handleResize);
    animate();
    
    // Start lightning effect
    lightningTimeout = setTimeout(triggerLightning, 
      Math.random() * settings.lightningFrequency);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(lightningTimeout);
    };
  }, [intensity]);
  
  return (
    <>
      <canvas 
        ref={canvasRef}
        className={styles.rainCanvas}
        aria-hidden="true"
      />
      <div 
        className={`${styles.lightning} ${isLightning ? styles.active : ''}`}
        aria-hidden="true"
      />
    </>
  );
};

export default RainEffectWithLightning;