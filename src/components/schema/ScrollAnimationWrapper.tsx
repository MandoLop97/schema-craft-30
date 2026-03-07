import React, { useRef, useEffect, useState } from 'react';

export type ScrollAnimationType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'none';

interface ScrollAnimationWrapperProps {
  children: React.ReactNode;
  animation: ScrollAnimationType;
  delay?: string;
  duration?: string;
}

export function ScrollAnimationWrapper({ children, animation, delay = '0s', duration = '0.6s' }: ScrollAnimationWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (animation === 'none') return <>{children}</>;

  const animationMap: Record<string, string> = {
    fadeIn: `nxr-scroll-fadeIn ${duration} ease-out ${delay} forwards`,
    slideUp: `nxr-scroll-slideUp ${duration} ease-out ${delay} forwards`,
    slideLeft: `nxr-scroll-slideLeft ${duration} ease-out ${delay} forwards`,
    slideRight: `nxr-scroll-slideRight ${duration} ease-out ${delay} forwards`,
    scaleIn: `nxr-scroll-scaleIn ${duration} ease-out ${delay} forwards`,
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? undefined : 0,
        animation: isVisible ? animationMap[animation] : undefined,
      }}
    >
      {children}
    </div>
  );
}
