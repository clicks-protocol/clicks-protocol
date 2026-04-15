"use client";

import { useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Stats } from '@/components/stats';
import { Calculator } from '@/components/calculator';
import { HowItWorks } from '@/components/how-it-works';
import { X402Section } from '@/components/x402-section';
import { Developers } from '@/components/developers';
import { XPixelDeveloperView } from '@/components/x-pixel-events';
import { Footer } from '@/components/footer';

export default function Home() {
  useEffect(() => {
    // Cursor Glow Effect
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    cursorGlow.id = 'cursorGlow';
    document.body.appendChild(cursorGlow);

    const handleMouseMove = (e: MouseEvent) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
      cursorGlow.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      cursorGlow.style.opacity = '0';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Intersection Observer for Fade In
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach((section) => {
      observer.observe(section);
    });

    // Parallax Effect
    const handleParallax = (e: MouseEvent) => {
      const parallaxElements = document.querySelectorAll('.parallax');
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;

      parallaxElements.forEach((element) => {
        const speed = parseFloat((element as HTMLElement).dataset.speed || '0.5');
        const x = mouseX * 20 * speed;
        const y = mouseY * 20 * speed;
        (element as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    document.addEventListener('mousemove', handleParallax);

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (this: HTMLAnchorElement, e: Event) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href')!);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', handleParallax);
      document.body.removeChild(cursorGlow);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Gradient Orbs */}
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      <div className="gradient-orb orb-3"></div>

      <Navbar />
      <Hero />
      <Stats />
      <Calculator />
      <HowItWorks />
      <X402Section />
      <Developers />
      <XPixelDeveloperView />
      <Footer />
    </>
  );
}
