// useIntersectionObserver.js
import { useEffect, useState } from 'react';

/**
 * Custom hook ที่ใช้ Intersection Observer API เพื่อตรวจสอบว่า element อยู่ในหน้าจอหรือไม่
 * 
 * @param {React.RefObject} elementRef - ref ของ element ที่ต้องการตรวจสอบ
 * @param {Object} options - options สำหรับ Intersection Observer
 * @param {number} options.threshold - ค่าระหว่าง 0-1 กำหนดสัดส่วนที่ต้องมองเห็นก่อนจะถือว่าอยู่ในหน้าจอ
 * @param {Element|null} options.root - element ที่ใช้เป็นพื้นที่มองเห็น (viewport)
 * @param {string} options.rootMargin - margin รอบ root element
 * @returns {boolean} isInView - true เมื่อ element อยู่ในหน้าจอ
 */
const useIntersectionObserver = (elementRef, options = {}) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const defaultOptions = {
      threshold: 0,
      root: null,
      rootMargin: '0px',
    };

    const observerOptions = { ...defaultOptions, ...options };

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, observerOptions);

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isInView;
};

export default useIntersectionObserver;