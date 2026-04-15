"use client";

import { useEffect } from 'react';

export function XPixelDeveloperView() {
  useEffect(() => {
    const section = document.getElementById('developers');
    if (!section || typeof IntersectionObserver === 'undefined') return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (typeof window !== 'undefined' && (window as any).twq) {
            (window as any).twq('event', 'tw-rbppe-137mh5', {});
          }
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  return null;
}
