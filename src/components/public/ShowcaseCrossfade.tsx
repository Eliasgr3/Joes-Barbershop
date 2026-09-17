'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const PHOTOS = [
  { src: '/images/showcase-01-fade-beard.jpg', alt: 'Κούρεμα fade με γένια' },
  { src: '/images/showcase-02-mid-fade.jpg', alt: 'Mid fade' },
  { src: '/images/showcase-03-skin-fade.jpg', alt: 'Skin fade' },
  { src: '/images/showcase-04-slick-back.jpg', alt: 'Slick back με fade' },
  { src: '/images/showcase-05-curly.jpg', alt: 'Κούρεμα σε σγουρά μαλλιά' },
  { src: '/images/showcase-06-textured-crop.jpg', alt: 'Textured crop' },
  { src: '/images/showcase-07-classic-beard.jpg', alt: 'Κλασικό κούρεμα με γένια' },
];

const DELAY_MS = 3400;

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

export function ShowcaseCrossfade() {
  const [active, setActive] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [isVisible, setIsVisible] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !stageRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !isVisible) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % PHOTOS.length), DELAY_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, isVisible, active]);

  useEffect(() => {
    const onVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  if (reducedMotion) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {PHOTOS.slice(0, 4).map((photo) => (
          <div key={photo.src} className="relative aspect-[4/5]">
            <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        ref={stageRef}
        className="relative mx-auto aspect-[4/5] max-h-[76vh] overflow-hidden bg-black md:aspect-[16/10]"
      >
        {PHOTOS.map((photo, i) => (
          <figure
            key={photo.src}
            className="absolute inset-0 transition-opacity duration-[1100ms] ease-in-out"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <Image src={photo.src} alt={photo.alt} fill className="object-cover" priority={i === 0} />
          </figure>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-[7px]">
        {PHOTOS.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            aria-label={`Φωτογραφία ${i + 1}`}
            aria-current={i === active}
            onClick={() => setActive(i)}
            className={`h-[7px] rounded-full bg-white/30 transition-all ${i === active ? 'w-[22px] rounded bg-white' : 'w-[7px]'}`}
          />
        ))}
      </div>
    </>
  );
}
