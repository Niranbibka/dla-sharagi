export type LiquidBlob = { x: number; y: number; width: number; height: number };
type Point = { x: number; y: number };

function capsuleDistance(x: number, y: number, blob: LiquidBlob) {
  const r = blob.height / 2;
  const dx = Math.max(Math.abs(x - blob.x) - Math.max(0, blob.width / 2 - r), 0);
  return Math.hypot(dx, y - blob.y) - r;
}

function smoothMinimum(a: number, b: number, blend: number) {
  const h = Math.max(blend - Math.abs(a - b), 0) / blend;
  return Math.min(a, b) - h * h * blend * .25;
}

function contourPath(points: Point[]) {
  const n = (v: number) => Number(v.toFixed(2));
  let path = `M${n(points[0].x)},${n(points[0].y)}`;
  for (let i = 0; i < points.length; i++) {
    const a = points[(i - 1 + points.length) % points.length];
    const b = points[i];
    const c = points[(i + 1) % points.length];
    const d = points[(i + 2) % points.length];
    path += `C${n(b.x + (c.x - a.x) / 6)},${n(b.y + (c.y - a.y) / 6)} ${n(c.x - (d.x - b.x) / 6)},${n(c.y - (d.y - b.y) / 6)} ${n(c.x)},${n(c.y)}`;
  }
  return `${path}Z`;
}

// Nearby lenses are one continuous signed-distance field, with a liquid neck.
// There are no overlapping transparent rectangles or seams inside the union.
export function liquidUnionPath(input: LiquidBlob[], blend = 12) {
  const blobs = input.filter(b => b.height > .5 && b.width > .5);
  if (!blobs.length) return '';
  const y = blobs[0].y;
  const min = Math.floor(Math.min(...blobs.map(b => b.x - b.width / 2)) - blend);
  const max = Math.ceil(Math.max(...blobs.map(b => b.x + b.width / 2)) + blend);
  const limit = Math.max(...blobs.map(b => b.height / 2)) + blend;
  const distance = (x: number, py: number) => blobs.reduce((d, b) => smoothMinimum(d, capsuleDistance(x, py, b), blend), 100000);
  const groups: Point[][] = [];
  let group: Point[] = [];
  for (let x = min; x <= max; x += 1.5) {
    if (distance(x, y) >= 0) {
      if (group.length) { groups.push(group); group = []; }
      continue;
    }
    let low = 0;
    let high = limit;
    for (let step = 0; step < 10; step++) {
      const middle = (low + high) / 2;
      if (distance(x, y + middle) < 0) low = middle;
      else high = middle;
    }
    group.push({ x, y: y - (low + high) / 2 });
  }
  if (group.length) groups.push(group);
  return groups.filter(points => points.length > 1).map(points => contourPath([
    { x: points[0].x - .5, y }, ...points,
    { x: points[points.length - 1].x + .5, y },
    ...[...points].reverse().map(p => ({ x: p.x, y: 2 * y - p.y })),
  ])).join('');
}
