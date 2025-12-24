
import { useState, useEffect, useRef } from 'react';

export function useStepCounter(initialSteps: number, onStep: (newCount: number) => void) {
  const [steps, setSteps] = useState(initialSteps);
  const [isTracking, setIsTracking] = useState(false);

  // Use refs to keep the listener stable and avoid re-renders restarting the logic
  const onStepRef = useRef(onStep);
  const isPeakRef = useRef(false);
  const stepsRef = useRef(initialSteps);

  // Sync refs with props/state
  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  useEffect(() => {
    // Only update stepsRef if initialSteps actually changed from a external source (e.g. data load)
    // and it's significantly different from our current local count
    if (Math.abs(stepsRef.current - initialSteps) > 10) {
      stepsRef.current = initialSteps;
      setSteps(initialSteps);
    }
  }, [initialSteps]);

  useEffect(() => {
    const threshold = 12.5; // Чувствительность для обнаружения шага

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const magnitude = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);

      if (magnitude > threshold && !isPeakRef.current) {
        isPeakRef.current = true;

        const nextSteps = stepsRef.current + 1;
        stepsRef.current = nextSteps;
        setSteps(nextSteps);
        onStepRef.current(nextSteps);

      } else if (magnitude < threshold - 2) {
        isPeakRef.current = false;
      }
    };

    const startTracking = () => {
      if (typeof DeviceMotionEvent !== 'undefined') {
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

    startTracking();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []); // Run only once to keep the listener stable

  return { steps, isTracking };
}
