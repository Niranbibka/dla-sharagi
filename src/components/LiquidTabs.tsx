import { useId, useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { liquidUnionPath } from '../lib/liquid-union';

type Props = { values: string[]; value: string | null; onChange: (value: string) => void };
type Channel = { value: number; target: number; speed: number; stiffness: number; damping: number };
type TabRect = { x: number; width: number };
const channel = (value: number, stiffness = 300, damping = 36): Channel => ({ value, target: value, speed: 0, stiffness, damping });

export default function LiquidTabs({ values, value, onChange }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const material = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const svg = useRef<SVGSVGElement>(null);
  const rects = useRef<TabRect[]>([]);
  const height = useRef(36);
  const selected = useRef(value);
  selected.current = value;
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const frame = useRef(0);
  const last = useRef(0);
  const initialized = useRef(false);
  const state = useRef({
    x: channel(0), width: channel(40, 220, 32), amount: channel(0),
    tailX: channel(0, 145, 27), tailWidth: channel(40, 160, 28), tailAmount: channel(0, 110, 23),
  });
  const id = `liquid-light-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  function draw() {
    const s = state.current;
    const lensHeight = Math.min(32, Math.max(24, height.current - 4));
    const y = height.current / 2 + 8;
    const a = Math.max(0, Math.min(1, s.amount.value));
    const b = Math.max(0, Math.min(1, s.tailAmount.value));
    const stretch = reducedRef.current ? 0 : Math.min(16, Math.abs(s.x.speed) * .022);
    const path = liquidUnionPath([
      { x: s.x.value + 8, y, width: s.width.value * a + stretch, height: lensHeight * a },
      { x: s.tailX.value + 8, y, width: s.tailWidth.value * Math.sqrt(b), height: lensHeight * b * .92 },
    ], 20);
    paths.current.forEach(element => element?.setAttribute('d', path));
    if (material.current) {
      material.current.style.clipPath = path ? `path("${path}")` : 'polygon(0 0,0 0,0 0)';
      material.current.style.opacity = path ? '1' : '0';
    }
  }

  function tick(time: number) {
    const dt = Math.min(.024, last.current ? (time - last.current) / 1000 : 1 / 60);
    last.current = time;
    let moving = false;
    Object.values(state.current).forEach(c => {
      c.speed += ((c.target - c.value) * c.stiffness - c.speed * c.damping) * dt;
      c.value += c.speed * dt;
      if (Math.abs(c.target - c.value) < .015 && Math.abs(c.speed) < .02) {
        c.value = c.target;
        c.speed = 0;
      } else moving = true;
    });
    draw();
    frame.current = moving ? requestAnimationFrame(tick) : 0;
  }

  function wake() {
    if (reducedRef.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      Object.values(state.current).forEach(c => { c.value = c.target; c.speed = 0; });
      draw();
      return;
    }
    if (!frame.current) { last.current = 0; frame.current = requestAnimationFrame(tick); }
  }

  function targetSelection() {
    const target = rects.current[values.indexOf(selected.current ?? '')];
    const s = state.current;
    s.amount.target = target ? 1 : 0;
    if (target) { s.x.target = target.x; s.width.target = target.width; }
    s.tailAmount.target = 0;
    if (!initialized.current && target) {
      Object.values(s).forEach(c => { c.value = c.target; c.speed = 0; });
      s.tailX.value = s.tailX.target = target.x;
      s.tailWidth.value = s.tailWidth.target = target.width;
      initialized.current = true;
    }
    wake();
  }

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => {
      const width = Math.max(element.clientWidth, ...buttons.current.map(button => button ? button.offsetLeft + button.offsetWidth : 0));
      height.current = element.clientHeight;
      rects.current = buttons.current.map(button => ({ x: button ? button.offsetLeft + button.offsetWidth / 2 : 0, width: button?.offsetWidth ?? 40 }));
      if (svg.current) {
        svg.current.setAttribute('viewBox', `0 0 ${width + 16} ${height.current + 16}`);
        svg.current.style.width = `${width + 16}px`;
        svg.current.style.height = `${height.current + 16}px`;
      }
      if (material.current) { material.current.style.width = `${width + 16}px`; material.current.style.height = `${height.current + 16}px`; }
      targetSelection();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    buttons.current.forEach(button => { if (button) observer.observe(button); });
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current); frame.current = 0; };
  }, []);

  useLayoutEffect(() => { targetSelection(); }, [value, reduced]);

  function choose(index: number) {
    const s = state.current;
    const target = rects.current[index];
    if (target && values[index] !== selected.current && !reducedRef.current) {
      s.tailX.value = s.x.value;
      s.tailWidth.value = s.width.value;
      s.tailAmount.value = .9;
      s.tailX.speed = s.tailWidth.speed = s.tailAmount.speed = 0;
      s.tailX.target = target.x;
      s.tailWidth.target = target.width;
      s.tailAmount.target = 0;
      s.x.target = target.x;
      s.width.target = target.width;
      s.amount.target = 1;
    }
    wake();
    onChange(values[index]);
  }

  return <div ref={root} className="filter-tabs liquid-tabs" aria-label="Темы статей">
    <div ref={material} className="liquid-union-material" aria-hidden="true"/>
    <svg ref={svg} className="liquid-union-edges" aria-hidden="true" focusable="false">
      <defs><filter id={id} x="-5%" y="-15%" width="110%" height="130%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation=".65" result="height"/>
        <feSpecularLighting in="height" surfaceScale="2.4" specularConstant=".5" specularExponent="24" lightingColor="#ffffff" result="light"><feDistantLight azimuth="225" elevation="55"/></feSpecularLighting>
        <feComposite in="light" in2="SourceAlpha" operator="in"/>
      </filter></defs>
      <path ref={element => { paths.current[0] = element; }} className="liquid-union-rim"/>
      <path ref={element => { paths.current[1] = element; }} className="liquid-union-light" fill="#fff" filter={`url(#${id})`}/>
    </svg>
    {values.map((label, index) => <button key={label} ref={button => { buttons.current[index] = button; }} className={`filter-tab ${value === label ? 'active' : ''}`} aria-pressed={value === label}
      onClick={() => choose(index)}><span className="tab-label">{label}</span></button>)}
  </div>;
}
