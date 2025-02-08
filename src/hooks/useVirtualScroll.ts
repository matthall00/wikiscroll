import { useEffect, useState, useRef, RefObject } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  overscan: number;
  containerRef: RefObject<HTMLElement>;
}

interface VirtualScrollResult {
  virtualItems: number[];
  startIndex: number;
  endIndex: number;
}

export function useVirtualScroll<T>(
  items: T[],
  { itemHeight, overscan, containerRef }: VirtualScrollOptions
): VirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const resizeObserver = useRef<ResizeObserver>();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      setClientHeight(entries[0].contentRect.height);
    });

    observer.observe(container);
    resizeObserver.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
  );

  const virtualItems = Array.from(
    { length: endIndex - startIndex },
    (_, index) => startIndex + index
  );

  return {
    virtualItems,
    startIndex,
    endIndex,
  };
}