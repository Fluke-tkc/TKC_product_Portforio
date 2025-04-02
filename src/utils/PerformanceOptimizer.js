// PerformanceOptimizer.js
import { useEffect } from 'react';

// ตัวช่วยจัดการ Performance และป้องกัน Memory Leak
const usePerformanceOptimizer = (options = {}) => {
  useEffect(() => {
    const defaultOptions = {
      disableHardwareAcceleration: false, // ปิด hardware acceleration สำหรับอุปกรณ์ที่มีปัญหา
      reducedMotion: false,               // ลดการเคลื่อนไหวสำหรับอุปกรณ์ประสิทธิภาพต่ำ
      lowPowerMode: false,                // โหมดประหยัดพลังงาน
    };

    const settings = { ...defaultOptions, ...options };
    let cleanup = [];

    // ตรวจสอบประสิทธิภาพอุปกรณ์
    const checkDevicePerformance = () => {
      // ตรวจสอบว่าเป็น low-end device หรือไม่ (ใช้วิธีคร่าวๆ)
      const isLowEndDevice = (
        navigator.deviceMemory < 4 || // น้อยกว่า 4GB RAM (ถ้า browser รองรับ)
        navigator.hardwareConcurrency < 4 || // CPU น้อยกว่า 4 cores
        /iPad|iPhone|iPod/.test(navigator.userAgent) || // iOS devices มักมีปัญหากับ WebGL ซับซ้อน
        /Android/.test(navigator.userAgent) // Android devices
      );

      // ตรวจสอบว่าผู้ใช้ต้องการลด animations หรือไม่
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      return {
        isLowEndDevice,
        prefersReducedMotion,
      };
    };

    const devicePerformance = checkDevicePerformance();

    // สร้าง meta tag เพื่อป้องกันการเลื่อนและซูมที่ไม่ต้องการ (ลดการใช้ GPU)
    if (settings.disableHardwareAcceleration || devicePerformance.isLowEndDevice) {
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        const originalContent = metaViewport.content;
        metaViewport.content = `${originalContent}, maximum-scale=1.0, user-scalable=no`;
        cleanup.push(() => {
          metaViewport.content = originalContent;
        });
      }
    }

    // เพิ่ม class สำหรับลดการเคลื่อนไหวบน low-end devices
    if (settings.reducedMotion || devicePerformance.prefersReducedMotion || devicePerformance.isLowEndDevice) {
      document.body.classList.add('reduced-motion');
      cleanup.push(() => {
        document.body.classList.remove('reduced-motion');
      });
    }

    // ผูกฟังก์ชัน visibility change เพื่อหยุด animations เมื่อไม่ได้มองหน้าจอ
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.classList.add('page-hidden');
      } else {
        document.body.classList.remove('page-hidden');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    cleanup.push(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });

    // แก้ปัญหา Safari ที่มักเกิด memory leak กับ 3D transforms
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      document.body.classList.add('safari-fixes');
      cleanup.push(() => {
        document.body.classList.remove('safari-fixes');
      });
    }

    return () => {
      // ทำความสะอาดทั้งหมดเมื่อ component unmount
      cleanup.forEach(fn => fn());
    };
  }, [options]);

  // ฟังก์ชันช่วยสำหรับล้าง animation frames และ timeouts ให้สะอาด
  const cleanupAnimations = (refs = {}) => {
    Object.entries(refs).forEach(([key, ref]) => {
      if (ref.current) {
        if (key.includes('animationFrame') || key.includes('Animation')) {
          cancelAnimationFrame(ref.current);
        } else if (key.includes('Timeout') || key.includes('timeout')) {
          clearTimeout(ref.current);
        } else if (key.includes('Interval') || key.includes('interval')) {
          clearInterval(ref.current);
        }
        ref.current = null;
      }
    });
  };

  return {
    cleanupAnimations,
  };
};

export default usePerformanceOptimizer;