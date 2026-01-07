import { useEffect, useState } from "react";

export default function useFitCount(ref, itemWidth, gap = 20) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const calc = () => {
      const width = ref.current.offsetWidth;
      if (!width) return;

      const fit = Math.floor((width + gap) / (itemWidth + gap));
      setCount(Math.max(1, fit));
    };

    calc();

    const observer = new ResizeObserver(calc);
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, itemWidth, gap]);

  return count;
}
