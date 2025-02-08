import { useState, useEffect } from 'react';

interface MotionPreferences {
  allowScroll: boolean;
  allowTransitions: boolean;
  allowAnimations: boolean;
}

export function useMotionPreference(): MotionPreferences {
  const [preferences, setPreferences] = useState<MotionPreferences>({
    allowScroll: true,
    allowTransitions: true,
    allowAnimations: true,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updatePreferences = (reduceMotion: boolean) => {
      setPreferences({
        // Allow essential scrolling even with reduced motion
        allowScroll: true,
        // Disable fancy transitions if reduced motion is preferred
        allowTransitions: !reduceMotion,
        // Disable decorative animations if reduced motion is preferred
        allowAnimations: !reduceMotion,
      });
    };

    // Initial check
    updatePreferences(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      updatePreferences(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return preferences;
}