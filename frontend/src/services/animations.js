import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const pageTransition = (element) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.inOut' }
  );
};

export const animateCounter = (element, endValue, duration = 1.5) => {
  if (!element) return;
  const obj = { value: 0 };
  gsap.to(obj, {
    value: endValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toLocaleString();
    },
  });
};

export const staggerCards = (elements) => {
  if (!elements?.length) return;
  gsap.fromTo(
    elements,
    { opacity: 0, y: 30, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
  );
};

export const animateChart = (element) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
  );
};

export const setupScrollSpy = (sections) => {
  sections.forEach((section) => {
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo(section, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      },
      once: true,
    });
  });
};

export const hoverScale = (element) => {
  if (!element) return;
  element.addEventListener('mouseenter', () => {
    gsap.to(element, { scale: 1.02, duration: 0.2, ease: 'power2.out' });
  });
  element.addEventListener('mouseleave', () => {
    gsap.to(element, { scale: 1, duration: 0.2, ease: 'power2.out' });
  });
};
