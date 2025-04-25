import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "../Contact/Contact";
import styles from "./TKC_Main.module.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { imageMapping } from "../../contexts/LanguageContext";
// import SnowEffect from '../Hero/snowEffect';
// import SongkranEffect  from '../Hero/SongkranEffect ';
import RainEffectWithLightning  from './RainEffectWithLightning';

// Configuration settings for different devices
const getDeviceSettings = () => {
  const isMobile = /iPhone|Android/i.test(navigator.userAgent);
  const isTablet = /iPad|tablet/i.test(navigator.userAgent) || 
                  (navigator.maxTouchPoints > 1 && window.innerWidth > 600 && window.innerWidth < 1200);

  if (isMobile) {
    return {
      translateZ: 200,
      itemWidth: 100,
      itemHeight: 140,
      rotationSpeed: 0.3,
      frameSkip: 2 // Render every 2 frames
    };
  } else if (isTablet) {
    return {
      translateZ: 350,
      itemWidth: 160,
      itemHeight: 200,
      rotationSpeed: 0.4,
      frameSkip: 1
    };
  } else {
    return {
      translateZ: 550,
      itemWidth: 150,
      itemHeight: 200,
      rotationSpeed: 0.5,
      frameSkip: 0
    };
  }
};

// Debounce function to prevent excessive calls
const debounce = (func, wait) => {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

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
  isDragging,
  translateZ
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
        '--quantity': total,
        '--translateZ': `${translateZ}px`
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
        loading="eager"
        decoding="async"
        onLoad={(e) => {
          e.target.classList.add(styles.loaded)
        }}
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
  const handleTouchStart = (e) => {
    onPress();
  };

  const handleTouchEnd = (e) => {
    onRelease();
  };

  return (
    <button
      className={`${styles.rotationButton} ${direction === 'left' ? styles.leftButton : styles.rightButton}`}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={`Rotate ${direction}`}
    >
      {direction === 'left' ? '◀' : '▶'}
    </button>
  );
};

export const TKC_Main = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [currentRotation, setCurrentRotation] = useState(() => {
    const savedPosition = localStorage.getItem('heroRotationPosition');
    return savedPosition ? parseFloat(savedPosition) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Memory reset state and ref
  const [memoryResetCount, setMemoryResetCount] = useState(0);
  const memoryResetTimerRef = useRef(null);
  
  // Device-specific settings
  const deviceSettings = useMemo(() => getDeviceSettings(), []);
  
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
  const frameCountRef = useRef(0);
  const initialRenderRef = useRef(true);
  
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
      id: 'smartLearning',
      image: '/image/Smart Learning.jpg',
      route: '/smart-solutions-learning_new',
      title: text.card3
    },
    {
      id: 'smartLogistics',
      image: '/image/Smart Logistics.jpg',
      route: '/smart-solutions-logistics_new',
      title: text.card4
    },
    {
      id: 'organizedCommunication',
      image: '/image/SmartSolutions_Organized_Communication_Cables.jpg',
      route: '/smart-solutions-organized_communication_cables_new',
      title: text.card5
    },
    {
      id: 'autonomous',
      image: '/image/Autonomous Solution.jpg',
      route: '/smart-solutions_autonomous_new',
      title: text.card6
    },
    {
      id: 'cyberSecurity',
      image: '/image/Cyber Security.jpg',
      route: '/smart-solutions-cybersecurity_new',
      title: text.card7
    },
    {
      id: 'smartFarming',
      image: '/image/Smart Farming.jpg',
      route: '/smart-solutions-farm_new',
      title: text.card8
    },
    {
      id: 'smartUtility',
      image: '/image/Smart Utility (Grid).jpg',
      route: '/smart-solutions-utility_new',
      title: text.card9
    },
    {
      id: 'cloudServices',
      image: '/image/Cloud Services.jpg',
      route: '/smart-solutions-cloudservice_new',
      title: text.card10
    }
  ];

  // Cleanup function for all timers and animation frames
  const clearAllTimers = useCallback(() => {
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
  }, []);

  // Function to reset memory usage periodically
  const resetMemoryUsage = useCallback(() => {
    // 1. Stop rotation temporarily
    setIsRotating(false);
    
    // 2. Clear all timers and animation frames
    clearAllTimers();
    
    // 3. Reset state variables
    dragState.current = {
      isDragging: false,
      startX: 0,
      lastX: 0,
      currentX: 0,
      velocity: 0,
      lastTimestamp: 0,
      isMoved: false
    };
    
    // 4. Force garbage collection indirectly
    frameCountRef.current = 0;
    wheelVelocityRef.current = 0;
    
    // 5. Update memory reset counter
    setMemoryResetCount(prev => prev + 1);
    
    // 6. Temporarily add CSS class to pause animations
    document.documentElement.classList.add('paused');
    
    // 7. Restart after a short delay
    setTimeout(() => {
      document.documentElement.classList.remove('paused');
      setIsRotating(true);
    }, 100);
    
    console.log(`[Memory Reset] Performed reset #${memoryResetCount + 1}`);
  }, [clearAllTimers, memoryResetCount]);

  // Save rotation position to localStorage
  useEffect(() => {
    if (!initialRenderRef.current) {
      localStorage.setItem('heroRotationPosition', currentRotation.toString());
    } else {
      initialRenderRef.current = false;
    }
  }, [currentRotation]);

  // Load saved rotation position
  useEffect(() => {
    const savedPosition = localStorage.getItem('heroRotationPosition');
    if (savedPosition) {
      setCurrentRotation(parseFloat(savedPosition));
    }
  }, []);

  // Handle language preference from referrer URL
  const { setLanguageDirectly } = useLanguage();
  
  useEffect(() => {
    // Check referrer URL for language setting
    const referrer = document.referrer;
    
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const pathSegments = referrerUrl.pathname.split('/');
        
        // Find language segment in path
        const lang = pathSegments.find(segment => segment === 'th' || segment === 'en');
        
        if (lang) {
          setLanguageDirectly(lang);
        }
      } catch (error) {
        console.error('Error parsing referrer URL:', error);
      }
    }
  }, [setLanguageDirectly]);
  
  // Set up memory reset interval
  useEffect(() => {
    // Set interval for memory reset (every 60 seconds)
    memoryResetTimerRef.current = setInterval(() => {
      resetMemoryUsage();
    }, 60000); // 60000ms = 1 minute
    
    return () => {
      if (memoryResetTimerRef.current) {
        clearInterval(memoryResetTimerRef.current);
        memoryResetTimerRef.current = null;
      }
    };
  }, [resetMemoryUsage]);
  
  // Save rotation position before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('heroRotationPosition', currentRotation.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentRotation]);

  // Handle music player
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/loveromanticinstrumental.m4a');
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

  // Handle window resize
  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 150);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsRotating(false);
        clearAllTimers();
        document.documentElement.classList.add('paused');
      } else if (document.visibilityState === 'visible' && !dragState.current.isDragging) {
        setIsRotating(true);
        document.documentElement.classList.remove('paused');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [clearAllTimers]);

  // Toggle music play/pause
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

  // Navigate to main website
  const handleButtonClick = () => {
    window.location.href = "https://www.tkc-services.com/th/home";
  };

  // Handle rotation button press
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

  // Handle rotation button release
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

  // Handle mouse wheel momentum effect
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

  // Handle mouse wheel event
  const handleWheel = useCallback((e) => {
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
  }, [clearAllTimers]);

  // Handle drag start event
  const handleDragStart = useCallback((e) => {
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
      document.addEventListener('touchmove', handleDragMove, { passive: true });
      document.addEventListener('touchend', handleDragEnd, { passive: true });
      document.addEventListener('touchcancel', handleDragEnd, { passive: true });
    } else {
      document.addEventListener('mousemove', handleDragMove, { passive: true });
      document.addEventListener('mouseup', handleDragEnd, { passive: true });
      document.addEventListener('mouseleave', handleDragEnd, { passive: true });
    }
  }, [clearAllTimers]);

  // Handle drag move event
  const handleDragMove = useCallback((e) => {
    if (!dragState.current.isDragging) return;

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

      setCurrentRotation(prev => {
        const newRotation = prev + (deltaX * DRAG_SETTINGS.sensitivity);
        return newRotation;
      });
    }
  }, []);

  // Handle drag end event
  const handleDragEnd = useCallback(() => {
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
  }, [handleDragMove]);

  // Add event listeners for wheel event
  useEffect(() => {
    const wheelOptions = { passive: true };
    document.addEventListener('wheel', handleWheel, wheelOptions);

    return () => {
      document.removeEventListener('wheel', handleWheel, wheelOptions);
      clearAllTimers();
    };
  }, [handleWheel, clearAllTimers]);

  // Automatic rotation animation with frame skipping for performance
  useEffect(() => {
    let animationId = null;
    let lastTimestamp = 0;
    
    const animateRotation = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      
      const deltaTime = (timestamp - lastTimestamp) / 1000;
      
      // Apply frame skipping for performance
      frameCountRef.current += 1;
      if (frameCountRef.current % (deviceSettings.frameSkip + 1) === 0) {
        if (isRotating && !dragState.current.isDragging && !isButtonPressedRef.current) {
          setCurrentRotation(prev => {
            // Use device-specific rotation speed
            const newRotation = prev + deviceSettings.rotationSpeed * deltaTime;
            return newRotation;
          });
        }
        lastTimestamp = timestamp;
      }
      
      animationId = requestAnimationFrame(animateRotation);
    };

    if (isRotating && !dragState.current.isDragging && !isButtonPressedRef.current) {
      animationId = requestAnimationFrame(animateRotation);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isRotating, deviceSettings.rotationSpeed, deviceSettings.frameSkip]);

  // Add keyboard controls
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

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      clearAllTimers();
      if (memoryResetTimerRef.current) {
        clearInterval(memoryResetTimerRef.current);
      }
    };
  }, [clearAllTimers]);

  // Manual memory reset when testing
  const forceMemoryReset = () => {
    resetMemoryUsage();
  };

  return (
    <>
    <RainEffectWithLightning intensity="low" />  
      <div className={styles.slider_section}>
      {/* <div className={styles.gifContainer}>
        <img src="/image/Rain.gif" alt="Animation" />
        </div> */}

        <button
          className={styles.musicButton}
          onClick={toggleMusic}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? '♫' : '♪'}
        </button>
   
        <div className={styles.eventImageContainer}></div>

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
          {/* Hidden in production, useful for testing */}
          {/* {process.env.NODE_ENV === 'development' && (
            <button
              className={styles.debugButton}
              onClick={forceMemoryReset}
              title="Force memory reset (debug only)"
            >
              🔄
            </button>
          )} */}
        </div>

        <button className={styles.topLeftButton} onClick={handleButtonClick} />
        <div className={styles.gifContainer}>
        <img src="/image/Rain.gif" alt="Animation" />
        </div>

        <div className={styles.banner}>
          <div
            ref={sliderRef}
            className={`${styles.slider} ${isDragging ? styles.dragging : ''}`}
            style={{
              transform: `translateX(-50%) perspective(1000px) rotateX(${
                windowDimensions.width <= 900 ? '-16deg' : '0deg'
              }) rotateY(${currentRotation}deg)`,
              width: `${deviceSettings.itemWidth}px`,
              height: `${deviceSettings.itemHeight}px`
            }}
          >
            {IMAGE_ROUTES.map((item, index) => (
              <SliderItem
                key={index}
                id={item.id}
                image={item.image}
                position={index + 1}
                total={IMAGE_ROUTES.length}
                translateZ={deviceSettings.translateZ}
                onNavigate={(e) => {
                  if (!dragState.current.isMoved) {
                    e.stopPropagation();
                    localStorage.setItem('heroRotationPosition', currentRotation.toString());
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
    </>
  );
};

export default TKC_Main;