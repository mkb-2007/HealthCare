import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value,
  duration = 1800,
  className = "",
  triggerOnView = true,
}: {
  value: number | string;
  duration?: number;
  className?: string;
  triggerOnView?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [hasTriggered, setHasTriggered] = useState<boolean>(false);
  const elementRef = useRef<HTMLSpanElement | null>(null);

  // Intersection Observer to detect 30% visibility in viewport
  useEffect(() => {
    if (!triggerOnView || hasTriggered) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasTriggered(true);
          observer.disconnect(); // Run only once per page load
        }
      },
      {
        threshold: 0.3, // Start when at least 30% is visible
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [triggerOnView, hasTriggered]);

  useEffect(() => {
    const valStr = String(value);

    // Extract prefix, suffix, and numeric core
    const match = valStr.match(/^([^0-9\.]*)([0-9,\.]+)(.*)$/);

    if (!match) {
      setDisplayValue(valStr);
      return;
    }

    const prefix = match[1] || "";
    const rawNumStr = match[2].replace(/,/g, "");
    const targetNum = parseFloat(rawNumStr);
    const suffix = match[3] || "";
    const isDecimal = match[2].includes(".");
    const decimalPlaces = isDecimal ? (rawNumStr.split(".")[1]?.length || 1) : 0;
    const hasCommas = match[2].includes(",");

    if (isNaN(targetNum)) {
      setDisplayValue(valStr);
      return;
    }

    // Initial 0 display before intersection trigger
    const initialFormatted = isDecimal ? (0).toFixed(decimalPlaces) : "0";
    const formattedInitial = hasCommas ? "0" : initialFormatted;
    setDisplayValue(`${prefix}${formattedInitial}${suffix}`);

    if (triggerOnView && !hasTriggered) {
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // easeOutExpo for smooth deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentNum = easeProgress * targetNum;

      let formattedCurrent = isDecimal
        ? currentNum.toFixed(decimalPlaces)
        : Math.floor(currentNum).toString();

      if (hasCommas) {
        const parts = formattedCurrent.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        formattedCurrent = parts.join(".");
      }

      setDisplayValue(`${prefix}${formattedCurrent}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, triggerOnView, hasTriggered]);

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  );
}
