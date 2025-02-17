import React, { useEffect } from 'react';

const WaterEffect = () => {
  useEffect(() => {
    const container = document.getElementById('waterContainer');

    if (!container) {
      return;
    }

    const createWaterDrop = () => {
      const drop = document.createElement('div');
      drop.classList.add('waterDrop');
      
      // Random initial position
      drop.style.left = `${Math.random() * 100}vw`;
      
      // Random size between 10px and 30px
      const size = Math.random() * 20 + 10;
      drop.style.width = `${size}px`;
      drop.style.height = `${size}px`;
      
      // Random animation duration
      drop.style.animationDuration = `${Math.random() * 2 + 1}s`;
      
      // Random opacity
      drop.style.opacity = Math.random() * 0.7 + 0.3;
      
      // Add blur effect for more realistic water look
      const blurAmount = Math.random() * 2 + 1;
      drop.style.filter = `blur(${blurAmount}px)`;
      
      container.appendChild(drop);

      // Remove drop after animation completes
      setTimeout(() => {
        drop.remove();
      }, parseFloat(drop.style.animationDuration) * 1000);
    };

    // Create drops every 100ms
    const interval = setInterval(createWaterDrop, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="waterContainer"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}
    >
      <style>
        {`
          .waterDrop {
            position: absolute;
            background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(173,216,230,0.8));
            border-radius: 50%;
            pointer-events: none;
            animation: waterfall linear forwards;
          }

          @keyframes waterfall {
            0% {
              transform: translateY(-20vh) scale(0);
              opacity: 0;
            }
            20% {
              opacity: var(--opacity);
              transform: translateY(0) scale(1);
            }
            80% {
              opacity: var(--opacity);
            }
            100% {
              transform: translateY(100vh) scale(0.5);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default WaterEffect;