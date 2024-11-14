import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import styles from "./Hero_New.module.css";

const DRAG_SETTINGS = {
  sensitivity: 0.1,          // ความไวในการลาก
  momentumMultiplier: 1,     // ตัวคูณความเฉื่อย
  momentumDampening: 0.97,   // ค่าหน่วงความเฉื่อย
  minimumVelocity: 0.05,     // ความเร็วขั้นต่ำสำหรับความเฉื่อย
  rotationSpeed: 2,          // ความเร็วในการหมุนอัตโนมัติ
  autoRotateDelay: 3000,     // ระยะเวลารอก่อนหมุนอัตโนมัติ
  clickThreshold: {
    duration: 200,           // ระยะเวลาสูงสุดที่ถือว่าเป็นการคลิก (ms)
    movement: 5              // ระยะทางสูงสุดที่ถือว่าเป็นการคลิก (px)
  },
  wheel: {
    sensitivity: 0.5,        // ความไวในการหมุนด้วย wheel
    momentum: true,          // เปิดใช้ momentum สำหรับ wheel
    momentumDuration: 1000,  // ระยะเวลาของ momentum (ms)
    debounceTime: 150        // เวลารอก่อนเริ่มหมุนอัตโนมัติหลังใช้ wheel
  }
};

const IMAGE_ROUTES = [
  { 
    image: '/image/smartsolution2.png',
    route: '/smart-solutions-building_new',
    title: 'Smart Building'
  },
  { 
    image: '/image/Smart Hospital.jpg',
    route: '/smart-hospital',
    title: 'Smart Hospital'
  },
  { 
    image: '/image/Samrt Platform.jpg',
    route: '/smart-platform',
    title: 'Smart Platform'
  },
  { 
    image: '/image/Smart Learning.jpg',
    route: '/smart-learning',
    title: 'Smart Learning'
  },
  { 
    image: '/image/Smart Logistics.jpg',
    route: '/smart-logistics',
    title: 'Smart Logistics'
  },
  { 
    image: '/image/SmartSolutions_Organized_Communication_Cables.jpg',
    route: '/communication-solutions',
    title: 'SmartOrganized Communication Cables'
  },
  { 
    image: '/image/Autonomous Solution.jpg',
    route: '/autonomous-solutions',
    title: 'Autonomous'
  },
  { 
    image: '/image/Cyber Security.jpg',
    route: '/cyber-security',
    title: 'Cyber Security'
  },
  { 
    image: '/image/Smart Farming.jpg',
    route: '/smart-farming',
    title: 'Smart Farming'
  },
  { 
    image: '/image/Smart Utility (Grid).jpg',
    route: '/smart-solutions-utility_new',
    title: 'Smart Utility'
  },
  { 
    image: '/image/Cloud Services.jpg',
    route: '/cloud-services',
    title: 'Cloud Services'
  }
];
const SliderItem = ({ 
  image, 
  position, 
  total, 
  onNavigate, 
  title, 
  onDragStart,
  isDragging 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const clickStartTimeRef = useRef(0);
  const clickStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseDown = (e) => {
    clickStartTimeRef.current = Date.now();
    clickStartPosRef.current = {
      x: e.touches ? e.touches[0].clientX : e.clientX,
      y: e.touches ? e.touches[0].clientY : e.clientY
    };
    hasMovedRef.current = false;
    onDragStart(e);
  };

  const handleClick = (e) => {
    const clickEndTime = Date.now();
    const clickDuration = clickEndTime - clickStartTimeRef.current;
    
    const currentPos = {
      x: e.clientX,
      y: e.clientY
    };
    
    const deltaX = Math.abs(currentPos.x - clickStartPosRef.current.x);
    const deltaY = Math.abs(currentPos.y - clickStartPosRef.current.y);
    const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (clickDuration < DRAG_SETTINGS.clickThreshold.duration && 
        totalMovement < DRAG_SETTINGS.clickThreshold.movement && 
        !isDragging && 
        !hasMovedRef.current) {
      onNavigate(e);
    }
  };

  const handleTouchStart = (e) => {
    handleMouseDown(e);
  };

  return (
    <div 
      className={`${styles.item} ${isDragging ? styles.dragging : ''}`}
      style={{ 
        '--position': position,
        '--quantity': total
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="button"
      tabIndex={0}
      aria-label={`Navigate to ${title}`}
    >
      <img 
        src={image} 
        alt={title}
        draggable={false}
        className={styles.itemImage}
      />
      <div 
        className={`${styles.itemOverlay} ${isHovered ? styles.hovered : ''}`}
      >
        <span className={styles.itemTitle}>{title}</span>
      </div>
    </div>
  );
};
export const Hero_New = () => {
  const navigate = useNavigate();
  
  // State management
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [currentRotation, setCurrentRotation] = useState(0);
  
  // Refs
  const sliderRef = useRef(null);
  const animationFrameRef = useRef(null);
  const autoRotateTimeoutRef = useRef(null);
  const wheelTimeoutRef = useRef(null);
  const wheelMomentumRef = useRef(null);
  const wheelVelocityRef = useRef(0);
  
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    lastX: 0,
    currentX: 0,
    velocity: 0,
    lastTimestamp: 0,
    isMoved: false
  });

  const clearAllTimers = () => {
    if (autoRotateTimeoutRef.current) {
      clearTimeout(autoRotateTimeoutRef.current);
      autoRotateTimeoutRef.current = null;
    }
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = null;
    }
    if (wheelMomentumRef.current) {
      cancelAnimationFrame(wheelMomentumRef.current);
      wheelMomentumRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleWheelMomentum = () => {
    if (Math.abs(wheelVelocityRef.current) < DRAG_SETTINGS.minimumVelocity) {
      wheelMomentumRef.current = null;
      wheelVelocityRef.current = 0;
      
      wheelTimeoutRef.current = setTimeout(() => {
        setIsRotating(true);
      }, DRAG_SETTINGS.wheel.debounceTime);
      
      return;
    }
  
    setCurrentRotation(prev => prev + (wheelVelocityRef.current * DRAG_SETTINGS.wheel.sensitivity)); // ลบ modulo ออก
  
    wheelVelocityRef.current *= DRAG_SETTINGS.momentumDampening;
    wheelMomentumRef.current = requestAnimationFrame(handleWheelMomentum);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    
    setIsRotating(false);
    clearAllTimers();
  
    const delta = Math.sign(e.deltaY || e.deltaX);
    const wheelDelta = delta * DRAG_SETTINGS.wheel.sensitivity;
  
    setCurrentRotation(prev => prev + wheelDelta); // ลบ modulo ออก
  
    wheelVelocityRef.current = wheelDelta;
  
    if (DRAG_SETTINGS.wheel.momentum) {
      if (wheelMomentumRef.current) {
        cancelAnimationFrame(wheelMomentumRef.current);
      }
      wheelMomentumRef.current = requestAnimationFrame(handleWheelMomentum);
    } else {
      wheelTimeoutRef.current = setTimeout(() => {
        setIsRotating(true);
      }, DRAG_SETTINGS.wheel.debounceTime);
    }
  };
  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const point = e.touches ? e.touches[0] : e;
    
    dragState.current = {
      isDragging: true,
      startX: point.clientX,
      lastX: point.clientX,
      currentX: point.clientX,
      velocity: 0,
      lastTimestamp: Date.now(),
      isMoved: false
    };

    setIsRotating(false);
    clearAllTimers();

    if (e.touches) {
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      document.addEventListener('touchcancel', handleDragEnd);
    } else {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('mouseleave', handleDragEnd);
    }
  };

  const handleDragMove = (e) => {
    if (!dragState.current.isDragging) return;
  
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    
    const deltaX = point.clientX - dragState.current.lastX;
    const absDeltaX = Math.abs(deltaX);
  
    if (absDeltaX > DRAG_SETTINGS.clickThreshold.movement) {
      dragState.current.isMoved = true;
      setIsDragging(true);
    }
  
    if (dragState.current.isMoved) {
      const now = Date.now();
      const deltaTime = now - dragState.current.lastTimestamp;
      
      dragState.current.velocity = deltaX / deltaTime;
      dragState.current.lastX = point.clientX;
      dragState.current.lastTimestamp = now;
  
      setCurrentRotation(prev => prev + (deltaX * DRAG_SETTINGS.sensitivity)); // ลบ modulo ออก
    }
  };
  const handleDragEnd = () => {
    if (!dragState.current.isDragging) return;

    const wasDragging = dragState.current.isMoved;
    
    dragState.current.isDragging = false;
    dragState.current.isMoved = false;
    setIsDragging(false);

    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('mouseleave', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
    document.removeEventListener('touchcancel', handleDragEnd);

    if (wasDragging) {
      const finalVelocity = dragState.current.velocity;
      if (Math.abs(finalVelocity) > DRAG_SETTINGS.minimumVelocity) {
        const momentum = finalVelocity * DRAG_SETTINGS.momentumMultiplier;
        let currentVelocity = momentum;

        const applyMomentum = () => {
          if (Math.abs(currentVelocity) < DRAG_SETTINGS.minimumVelocity) {
            cancelAnimationFrame(animationFrameRef.current);
            autoRotateTimeoutRef.current = setTimeout(() => {
              setIsRotating(true);
            }, DRAG_SETTINGS.autoRotateDelay);
            return;
          }

          setCurrentRotation(prev => {
            const newRotation = prev + (currentVelocity * DRAG_SETTINGS.sensitivity);
            return newRotation; //%360
          });

          currentVelocity *= DRAG_SETTINGS.momentumDampening;
          animationFrameRef.current = requestAnimationFrame(applyMomentum);
        };

        animationFrameRef.current = requestAnimationFrame(applyMomentum);
      } else {
        autoRotateTimeoutRef.current = setTimeout(() => {
          setIsRotating(true);
        }, DRAG_SETTINGS.autoRotateDelay);
      }
    }
  };

  const handleNavigation = (route, event) => {
    if (!dragState.current.isMoved) {
      event.stopPropagation();
      navigate(route);
    }
  };

  // Add wheel event listener effect
  // useEffect(() => {
  //   const sliderElement = sliderRef.current;
    
  //   if (sliderElement) {
  //     sliderElement.addEventListener('wheel', handleWheel, { passive: false });
  //   }

  //   return () => {
  //     if (sliderElement) {
  //       sliderElement.removeEventListener('wheel', handleWheel);
  //     }
  //     clearAllTimers();
  //   };
  // }, []);
  useEffect(() => {
    document.addEventListener('wheel', handleWheel, { passive: false });
  
    return () => {
      document.removeEventListener('wheel', handleWheel);
      clearAllTimers();
    };
  }, []);

  // Auto-rotation effect
  useEffect(() => {
    let lastTimestamp = 0;

    const animateRotation = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isRotating && !dragState.current.isDragging) {
        setCurrentRotation(prev => {
          const newRotation = prev + DRAG_SETTINGS.rotationSpeed * deltaTime;
          return newRotation;//% 360
        });
      }

      animationFrameRef.current = requestAnimationFrame(animateRotation);
    };

    if (isRotating && !dragState.current.isDragging) {
      animationFrameRef.current = requestAnimationFrame(animateRotation);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRotating]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  return (
    <div className={styles.slider_section}>
      <div className={styles.banner}>
        <div 
          ref={sliderRef}
          className={`${styles.slider} ${isDragging ? styles.dragging : ''}`}
          style={{
            transform: `translateX(-50%) perspective(1000px) rotateX(${
              window.innerWidth <= 767 ? '-16deg' : '0deg'
            }) rotateY(${currentRotation}deg)`
          }}
        >
          {IMAGE_ROUTES.map((item, index) => (
            <SliderItem 
              key={index}
              image={item.image}
              position={index + 1}
              total={IMAGE_ROUTES.length}
              onNavigate={(e) => handleNavigation(item.route, e)}
              onDragStart={handleDragStart}
              isDragging={isDragging}
              title={item.title}
            />
          ))}
        </div>

        <div className={styles.content}>
          <h1 data-content="SMART SOLUTIONS">SMART SOLUTIONS</h1>
          <div className={styles.author}>
            <p>Transform your business with our innovative smart solutions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero_New;