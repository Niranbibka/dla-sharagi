import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

type RefractionMap = { source: string; width: number; height: number };
const mapCache = new Map<string, RefractionMap>();

// Encode a neutral displacement field. Only the curved rim bends the backdrop;
// the centre stays flat, so the material does not ripple or distort its labels.
function makeRefractionMap(width: number, height: number, radius: number): RefractionMap | null {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const r = Math.min(radius, w / 2, h / 2);
  const key = `${w}:${h}:${r}`;
  const cached = mapCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const pixels = context.createImageData(w, h);
  const rim = Math.min(14, h / 3);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + .5;
      const py = y + .5;
      const edges = [px, w - px, py, h - py];
      let distance = Math.min(...edges);
      const edge = edges.indexOf(distance);
      let nx = edge === 0 ? -1 : edge === 1 ? 1 : 0;
      let ny = edge === 2 ? -1 : edge === 3 ? 1 : 0;

      if ((px < r || px > w - r) && (py < r || py > h - r) && r > 0) {
        const cx = px < r ? r : w - r;
        const cy = py < r ? r : h - r;
        const u = (px - cx) / r;
        const v = (py - cy) / r;
        const q = Math.pow(u ** 4 + v ** 4, .25);
        distance = (1 - q) * r;
        const length = Math.hypot(u ** 3, v ** 3) || 1;
        nx = u ** 3 / length;
        ny = v ** 3 / length;
      }

      const t = Math.max(0, Math.min(1, 1 - distance / rim));
      const bend = distance >= 0 ? Math.sin(Math.PI * t) ** 2 : 0;
      const i = (y * w + x) * 4;
      pixels.data[i] = Math.round(127.5 + nx * bend * 127.5);
      pixels.data[i + 1] = Math.round(127.5 + ny * bend * 127.5);
      pixels.data[i + 2] = 128;
      pixels.data[i + 3] = 255;
    }
  }

  context.putImageData(pixels, 0, 0);
  const result = { source: canvas.toDataURL('image/png'), width: w, height: h };
  if (mapCache.size >= 8) mapCache.delete(mapCache.keys().next().value!);
  mapCache.set(key, result);
  return result;
}

export default function GlassSurface({ className, children }: { className: string; children: ReactNode }) {
  const surface = useRef<HTMLDivElement>(null);
  const id = `glass-rim-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [map, setMap] = useState<RefractionMap | null>(null);
  const supported = typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'url("#glass-rim")');

  useLayoutEffect(() => {
    const element = surface.current;
    if (!element || !supported) return;
    let frame = 0;
    let previous = '';
    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius) || 24;
      const signature = `${Math.round(width)}:${Math.round(height)}:${radius}`;
      if (signature === previous) return;
      previous = signature;
      setMap(makeRefractionMap(width, height, radius));
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    measure();
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [supported]);

  const optics = map && supported ? `url("#${id}") blur(6px) saturate(1)` : undefined;
  return <div ref={surface} className={`${className} glass-surface`} data-refraction={Boolean(optics)}>
    <svg className="glass-definitions" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>{map && <filter id={id} filterUnits="userSpaceOnUse" x="0" y="0" width={map.width} height={map.height} colorInterpolationFilters="sRGB">
        <feImage href={map.source} x="0" y="0" width={map.width} height={map.height} preserveAspectRatio="none" result="rim-normal"/>
        <feDisplacementMap in="SourceGraphic" in2="rim-normal" scale="10" xChannelSelector="R" yChannelSelector="G"/>
      </filter>}</defs>
    </svg>
    <div className="glass-optics" aria-hidden="true" style={{ backdropFilter: optics, WebkitBackdropFilter: optics }}/>
    <div className="glass-wash" aria-hidden="true"/>
    {children}
  </div>;
}
