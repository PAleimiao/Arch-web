import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';

const COLUMN_HEIGHT = 24;

interface RollingDigitProps {
  value: number;
}

function RollingDigit({ value }: RollingDigitProps) {
  const [displayNumber, setDisplayNumber] = useState<number>(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const currentNumber = useRef<number | null>(null);
  const targetNumber = useRef(value);
  const queueRef = useRef<number[]>([]);

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) return;

    if (currentNumber.current === null) {
      const initial = queueRef.current[0];
      currentNumber.current = initial;
      targetNumber.current = initial;
      setDisplayNumber(initial);
      queueRef.current.shift();
      processQueue();
      return;
    }

    if (isAnimating.current) return;

    const target = queueRef.current[0];
    isAnimating.current = true;

    const distance = (target - currentNumber.current) * COLUMN_HEIGHT;

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        y: -distance,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          currentNumber.current = target;
          setDisplayNumber(target);
          if (containerRef.current) {
            gsap.set(containerRef.current, { y: 0 });
          }
          isAnimating.current = false;
          queueRef.current.shift();
          processQueue();
        },
      });
    }
  }, []);

  useEffect(() => {
    if (value !== targetNumber.current) {
      targetNumber.current = value;
      queueRef.current.push(value);
      processQueue();
    }
  }, [value, processQueue]);

  return (
    <div className="time-column" style={{ width: 20 }}>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <div className="time-digit">{displayNumber}</div>
        <div className="time-digit" style={{ position: 'absolute', top: COLUMN_HEIGHT, left: 0, right: 0 }}>
          {displayNumber}
        </div>
      </div>
    </div>
  );
}

function useTime() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return time;
}

export default function RollingClock() {
  const time = useTime();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  
  const h1 = Math.floor(hours / 10);
  const h2 = hours % 10;
  const m1 = Math.floor(minutes / 10);
  const m2 = minutes % 10;
  const s1 = Math.floor(seconds / 10);
  const s2 = seconds % 10;
  
  return (
    <div className="flex items-center gap-1">
      <RollingDigit value={h1} />
      <RollingDigit value={h2} />
      <span className="time-digit" style={{ color: '#00B4D8', marginTop: -2 }}>:</span>
      <RollingDigit value={m1} />
      <RollingDigit value={m2} />
      <span className="time-digit" style={{ color: '#00B4D8', marginTop: -2 }}>:</span>
      <RollingDigit value={s1} />
      <RollingDigit value={s2} />
    </div>
  );
}
