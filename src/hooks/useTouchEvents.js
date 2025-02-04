// hooks/useTouchEvents.js
import { useEffect } from 'react';

export const useTouchEvents = (ref) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // แยกฟังก์ชันสำหรับแต่ละ event type
    const handleTouchStart = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // กำหนด options แยกสำหรับแต่ละ event
    const touchStartOptions = { passive: false };
    const touchMoveOptions = { passive: false };
    const touchEndOptions = { passive: true }; // ส่วนใหญ่ touchend ไม่จำเป็นต้อง preventDefault

    // เพิ่ม event listeners ด้วย options ที่เหมาะสม
    element.addEventListener('touchstart', handleTouchStart, touchStartOptions);
    element.addEventListener('touchmove', handleTouchMove, touchMoveOptions);
    element.addEventListener('touchend', handleTouchEnd, touchEndOptions);

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref]);
};