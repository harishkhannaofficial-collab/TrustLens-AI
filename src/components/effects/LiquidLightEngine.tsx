import React, { useEffect } from 'react';

/**
 * LiquidLightEngine
 * Implements iOS 26 Liquid Glass optical tracking:
 * 1. Global pointer tracking (specular glint moves with cursor)
 * 2. Mobile device orientation (gyroscope tilt parallax)
 * 3. Fluid droplet touch/click ripple propagation
 */
export const LiquidLightEngine: React.FC = () => {
  useEffect(() => {
    // 1. Mouse pointer tracking across the window
    const handleMouseMove = (e: MouseEvent) => {
      const root = document.documentElement;
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;
      
      root.style.setProperty('--liquid-mouse-x', `${xPercent.toFixed(1)}%`);
      root.style.setProperty('--liquid-mouse-y', `${yPercent.toFixed(1)}%`);
      
      // Calculate light angle from center of viewport (-30deg to +30deg)
      const angle = Math.atan2(e.clientY - window.innerHeight / 2, e.clientX - window.innerWidth / 2) * (180 / Math.PI);
      root.style.setProperty('--liquid-tilt-x', `${(angle * 0.1).toFixed(1)}deg`);
    };

    // 2. Mobile Gyroscope / Device Orientation Parallax
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const root = document.documentElement;
        // gamma: left-to-right tilt (-90 to 90)
        // beta: front-to-back tilt (-180 to 180)
        const tiltX = Math.max(-25, Math.min(25, e.gamma * 0.4));
        const tiltY = Math.max(-25, Math.min(25, e.beta * 0.4));
        root.style.setProperty('--liquid-tilt-x', `${tiltX.toFixed(1)}deg`);
        root.style.setProperty('--liquid-tilt-y', `${tiltY.toFixed(1)}deg`);
      }
    };

    // 3. Fluid droplet click ripple on interactive elements
    const handlePointerDown = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.liquid-interactive, .liquid-glass-card, .liquid-btn-primary, button');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 1.6;

      const ripple = document.createElement('span');
      ripple.className = 'liquid-ripple-effect';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x - size / 2}px`;
      ripple.style.top = `${y - size / 2}px`;

      (target as HTMLElement).style.position = 'relative';
      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return null;
};
