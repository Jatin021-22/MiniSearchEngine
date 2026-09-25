import { useEffect, useRef } from 'react';
import { pageTransition, animateCounter, staggerCards, animateChart } from '../services/animations';

export function usePageAnimation() {
  const ref = useRef(null);
  useEffect(() => {
    pageTransition(ref.current);
  }, []);
  return ref;
}

export function useCounterAnimation(value, duration = 1.5) {
  const ref = useRef(null);
  useEffect(() => {
    if (value !== undefined && ref.current) {
      animateCounter(ref.current, value, duration);
    }
  }, [value, duration]);
  return ref;
}

export function useStaggerAnimation(deps = []) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.stagger-item');
      staggerCards(cards);
    }
  }, deps);
  return containerRef;
}

export function useChartAnimation() {
  const ref = useRef(null);
  useEffect(() => {
    animateChart(ref.current);
  }, []);
  return ref;
}
