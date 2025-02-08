import React, { useState, useEffect } from 'react';
import { useMotionPreference } from '../../hooks/useMotionPreference';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loadingClassName?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  loadingClassName = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const { allowAnimations } = useMotionPreference();

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setOptimizedSrc('');

    // Try to load WebP version if supported
    const supportsWebP = async () => {
      const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => resolve(true);
          img.onerror = () => reject(false);
          img.src = webpData;
        });
        return true;
      } catch {
        return false;
      }
    };

    const loadImage = async () => {
      try {
        const useWebP = await supportsWebP();
        if (useWebP && src.includes('/thumb/')) {
          // Convert Wikipedia thumbnail URL to WebP if possible
          const webpSrc = src.replace(/\.[^.]+$/, '.webp');
          setOptimizedSrc(webpSrc);
        } else {
          setOptimizedSrc(src);
        }
      } catch {
        // Fallback to original format
        setOptimizedSrc(src);
      }
    };

    loadImage();
  }, [src]);

  return (
    <>
      {!isLoaded && <div className={loadingClassName} role="presentation" />}
      <img
        src={optimizedSrc || src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} ${
          allowAnimations ? 'transition-opacity duration-500' : ''
        }`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </>
  );
};

export default OptimizedImage;