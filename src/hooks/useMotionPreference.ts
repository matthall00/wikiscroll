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
    // Safely check for matchMedia support (for testing environments)
    const mediaQuery = typeof window !== 'undefined' && window.matchMedia 
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    
    if (mediaQuery) {
      const updatePreferences = (reduceMotion: boolean) => {
        setPreferences({
          allowScroll: true,
          allowTransitions: !reduceMotion,
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
    }
    return undefined;
  }, []);

  return preferences;
}