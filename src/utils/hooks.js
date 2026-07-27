import { useState, useRef, useEffect } from "react";

export function useIsDesktop(bp = 900) {
  const [v, setV] = useState(() => window.innerWidth >= bp);
  useEffect(() => {
    const fn = () => setV(window.innerWidth >= bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return v;
}

// controlled (opsiyonel): dışarıdan konum verilirse hook o konumu kullanır ve
// her değişiklikte onChange ile dışarı bildirir (parent state'e taşınabilir).
export function useDrag(controlled, onChange) {
  const [posState, setPosState] = useState({ x: 0, y: 0 });
  const pos = controlled || posState;
  const drag = useRef(false);
  const orig = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const move = (e) => {
      if (!drag.current) return;
      if (e.cancelable) e.preventDefault();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const next = { x: orig.current.px + cx - orig.current.mx, y: orig.current.py + cy - orig.current.my };
      setPosState(next);
      onChangeRef.current?.(next);
    };
    const up = () => { drag.current = false; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, []);

  const onDown = (e, cur) => {
    e.preventDefault();
    drag.current = true;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    orig.current = { mx: cx, my: cy, px: cur ? cur.x : pos.x, py: cur ? cur.y : pos.y };
  };

  return { pos, onDown };
}
