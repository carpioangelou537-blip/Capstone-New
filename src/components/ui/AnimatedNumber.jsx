import { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({ value, start = false }) {
  const match = String(value).match(/^([^\d]*)(\d[\d,]*)(.*)$/);
  const [display, setDisplay] = useState(match ? match[1] + "0" + match[3] : value);
  const raf = useRef(null);

  useEffect(() => {
    if (!match) {
      setDisplay(value);
      return;
    }
    if (start === false) return;
    const prefix = match[1];
    const target = parseInt(match[2].replace(/,/g, ""), 10);
    const suffix = match[3];
    const startT = performance.now();
    const duration = 900;

    function tick(now) {
      const p = Math.min(1, (now - startT) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = Math.round(target * eased);
      setDisplay(prefix + current.toLocaleString() + suffix);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, start]);

  return <>{display}</>;
}