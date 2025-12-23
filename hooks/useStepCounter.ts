
import { useState, useEffect } from 'react';

export function useStepCounter(initialSteps: number, onStep: (newCount: number) => void) {
  const [steps, setSteps] = useState(initialSteps);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let isPeak = false;
    const threshold = 12.5; // Чувствительность для обнаружения шага

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      // Рассчитываем общую магнитуду ускорения
      const magnitude = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      
      if (magnitude > threshold && !isPeak) {
        isPeak = true;
        setSteps(prev => {
          const next = prev + 1;
          onStep(next);
          return next;
        });
      } else if (magnitude < threshold - 2) {
        isPeak = false;
      }
    };

    const startTracking = () => {
      if (typeof DeviceMotionEvent !== 'undefined') {
        // На iOS требуется явное разрешение
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          (DeviceMotionEvent as any).requestPermission()
            .then((permissionState: string) => {
              if (permissionState === 'granted') {
                window.addEventListener('devicemotion', handleMotion);
                setIsTracking(true);
              }
            })
            .catch(console.error);
        } else {
          window.addEventListener('devicemotion', handleMotion);
          setIsTracking(true);
        }
      }
    };

    // Пытаемся запустить сразу
    startTracking();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [onStep]);

  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  return { steps, isTracking };
}
