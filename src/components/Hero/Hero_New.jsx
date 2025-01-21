import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import styles from "./Hero_New.module.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { imageMapping } from "../../contexts/LanguageContext";
import SnowEffect from '../Hero/snowEffect';
//import HeartEffect from '../Hero/HeartEffect';


const DRAG_SETTINGS = {
  sensitivity: 0.1,          
  momentumMultiplier: 1,     
  momentumDampening: 0.5,   
  minimumVelocity: 0.05,     
  rotationSpeed: 0.5,          
  autoRotateDelay: 3000,     
  continuousRotationSpeed: 1,
  clickThreshold: {
    duration: 200,           
    movement: 5              
  },
  wheel: {
    sensitivity: 2,        
    momentum: true,          
    momentumDuration: 1000,  
    debounceTime: 150        
  }
};

const SliderItem = ({ 
  id,
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
  const { language } = useLanguage();

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
        src={imageMapping[language][id]}
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

const RotationButton = ({ direction, onPress, onRelease }) => {
  return (
    <button
      className={`${styles.rotationButton} ${direction === 'left' ? styles.leftButton : styles.rightButton}`}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
      onTouchStart={onPress}
      onTouchEnd={onRelease}
      aria-label={`Rotate ${direction}`}
    >
      {direction === 'left' ? '◀' : '▶'}
    </button>
  );
};

export const Hero_New = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  
  const sliderRef = useRef(null);
  const animationFrameRef = useRef(null);
  const autoRotateTimeoutRef = useRef(null);
  const wheelTimeoutRef = useRef(null);
  const wheelMomentumRef = useRef(null);
  const wheelVelocityRef = useRef(0);
  const buttonRotationFrameRef = useRef(null);
  const isButtonPressedRef = useRef(false);
  const buttonDirectionRef = useRef(null);
  const audioRef = useRef(null);
  const { text } = useLanguage();
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    lastX: 0,
    currentX: 0,
    velocity: 0,
    lastTimestamp: 0,
    isMoved: false
  });

  const IMAGE_ROUTES = [
    { 
      id: 'smartsolution2',
      image: '/image/smartsolution2.jpg',
      route: '/smart-solutions-building_new',
      title: text.card1
    },
    { 
      id: 'smartHospital',
      image: '/image/Smart Hospital.jpg',
      route: '/smart-solutions-hospital_new',
      title: text.card2
    },
    { 
      id: 'smartPlatform',
      image: '/image/Samrt Platform.jpg',
      route: '/smart-platform',
      title: text.card3
    },
    { 
      id: 'smartLearning',
      image: '/image/Smart Learning.jpg',
      route: '/smart-solutions-learning_new',
      title: text.card4
    },
    { 
      id: 'smartLogistics',
      image: '/image/Smart Logistics.jpg',
      route: '/smart-solutions-logistics_new',
      title: text.card5
    },
    { 
      id: 'organizedCommunication',
      image: '/image/SmartSolutions_Organized_Communication_Cables.jpg',
      route: '/smart-solutions-organized_communication_cables_new',
      title: text.card6
    },
    { 
      id: 'autonomous',
      image: '/image/Autonomous Solution.jpg',
      route: '/smart-solutions_autonomous_new',
      title: text.card7
    },
    { 
      id: 'cyberSecurity',
      image: '/image/Cyber Security.jpg',
      route: '/smart-solutions-cybersecurity_new',
      title: text.card8
    },
    { 
      id: 'smartFarming',
      image: '/image/Smart Farming.jpg',
      route: '/smart-solutions-farm_new',
      title: text.card9
    },
    { 
      id: 'smartUtility',
      image: '/image/Smart Utility (Grid).jpg',
      route: '/smart-solutions-utility_new',
      title: text.card10
    },
    { 
      id: 'cloudServices',
      image: '/image/Cloud Services.jpg',
      route: '/smart-solutions-cloudservice_new',
      title: text.card11
    }
  ];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/valentine.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    const audio = audioRef.current;

    audio.addEventListener('playing', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('error', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('playing', () => setIsPlaying(true));
      audio.removeEventListener('pause', () => setIsPlaying(false));
      audio.removeEventListener('error', () => setIsPlaying(false));
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  

  const toggleMusic = async () => {
    try {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Music toggle failed:', error);
      setIsPlaying(false);
    }
  };

  const handleButtonClick = () => {
    window.location.href = "https://www.tkc-services.com/th/home";
  };

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
    if (buttonRotationFrameRef.current) {
      cancelAnimationFrame(buttonRotationFrameRef.current);
      buttonRotationFrameRef.current = null;
    }
  };

  const handleButtonPress = (direction) => {
    setIsRotating(false);
    clearAllTimers();
    isButtonPressedRef.current = true;
    buttonDirectionRef.current = direction;

    const rotate = () => {
      if (isButtonPressedRef.current) {
        setCurrentRotation(prev => {
          const delta = direction === 'left' ? 
            -DRAG_SETTINGS.continuousRotationSpeed : 
            DRAG_SETTINGS.continuousRotationSpeed;
          return prev + delta;
        });
        buttonRotationFrameRef.current = requestAnimationFrame(rotate);
      }
    };

    buttonRotationFrameRef.current = requestAnimationFrame(rotate);
  };

  const handleButtonRelease = () => {
    isButtonPressedRef.current = false;
    buttonDirectionRef.current = null;
    if (buttonRotationFrameRef.current) {
      cancelAnimationFrame(buttonRotationFrameRef.current);
    }
    autoRotateTimeoutRef.current = setTimeout(() => {
      setIsRotating(true);
    }, DRAG_SETTINGS.autoRotateDelay);
  };

  // Mouse wheel handling
  const handleWheelMomentum = () => {
    if (Math.abs(wheelVelocityRef.current) < DRAG_SETTINGS.minimumVelocity) {
      wheelMomentumRef.current = null;
      wheelVelocityRef.current = 0;
      
      wheelTimeoutRef.current = setTimeout(() => {
        setIsRotating(true);
      }, DRAG_SETTINGS.wheel.debounceTime);
      
      return;
    }
  
    setCurrentRotation(prev => prev + (wheelVelocityRef.current * DRAG_SETTINGS.wheel.sensitivity));
  
    wheelVelocityRef.current *= DRAG_SETTINGS.momentumDampening;
    wheelMomentumRef.current = requestAnimationFrame(handleWheelMomentum);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    
    setIsRotating(false);
    clearAllTimers();
  
    const delta = Math.sign(e.deltaY || e.deltaX);
    const wheelDelta = delta * DRAG_SETTINGS.wheel.sensitivity;
  
    setCurrentRotation(prev => prev + wheelDelta);
  
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
  
      setCurrentRotation(prev => prev + (deltaX * DRAG_SETTINGS.sensitivity));
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
            return newRotation;
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

  // Event listeners setup
  useEffect(() => {
    document.addEventListener('wheel', handleWheel, { passive: false });
  
    return () => {
      document.removeEventListener('wheel', handleWheel);
      clearAllTimers();
    };
  }, []);

  useEffect(() => {
    let lastTimestamp = 0;

    const animateRotation = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isRotating && !dragState.current.isDragging && !isButtonPressedRef.current) {
        setCurrentRotation(prev => prev + DRAG_SETTINGS.rotationSpeed * deltaTime);
      }

      animationFrameRef.current = requestAnimationFrame(animateRotation);
    };

    if (isRotating && !dragState.current.isDragging && !isButtonPressedRef.current) {
      animationFrameRef.current = requestAnimationFrame(animateRotation);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRotating]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handleButtonPress('left');
      } else if (e.key === 'ArrowRight') {
        handleButtonPress('right');
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        handleButtonRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Render
  return (
    <> 
     <SnowEffect /> 
      {/* <div id="container" className={styles.snowContainer}> */}
        <div className={styles.slider_section}>
          <button 
            className={styles.musicButton}
            onClick={toggleMusic}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isPlaying ? '♫' : '♪'}
          </button>

          <div className={styles.languageTabs}>
            <button 
              className={`${styles.languageTab} ${language === 'en' ? styles.active : ''}`}
              onClick={() => language !== 'en' && toggleLanguage()}
            >
              EN
            </button>
            <button 
              className={`${styles.languageTab} ${language === 'th' ? styles.active : ''}`}
              onClick={() => language !== 'th' && toggleLanguage()}
            >
              TH
            </button>
          </div>

          <button className={styles.topLeftButton} onClick={handleButtonClick} />
          
          <div className={styles.banner}>
            <div 
              ref={sliderRef}
              className={`${styles.slider} ${isDragging ? styles.dragging : ''}`}
              style={{
                transform: `translateX(-50%) perspective(1000px) rotateX(${
                  window.innerWidth <= 900 ? '-16deg' : '0deg'
                }) rotateY(${currentRotation}deg)`
              }}
            >
              {IMAGE_ROUTES.map((item, index) => (
                <SliderItem 
                  key={index}
                  id={item.id}
                  image={item.image}
                  position={index + 1}
                  total={IMAGE_ROUTES.length}
                  onNavigate={(e) => {
                    if (!dragState.current.isMoved) {
                      e.stopPropagation();
                      navigate(item.route);
                    }
                  }}
                  onDragStart={handleDragStart}
                  isDragging={isDragging}
                  title={item.title}
                />
              ))}
            </div>

            <RotationButton 
              direction="left"
              onPress={() => handleButtonPress('left')}
              onRelease={handleButtonRelease}
            />
            <RotationButton 
              direction="right"
              onPress={() => handleButtonPress('right')}
              onRelease={handleButtonRelease}
            />

            <div className={styles.content}>
              <h1 data-content={text.title}>{text.title}</h1>
              <div className={styles.author}>
                <p>{text.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      {/* </div> */}
    </>
  );
};

export default Hero_New;