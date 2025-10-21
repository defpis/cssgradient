// https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript
export function rgb2hsv(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; v: number } {
  const v = Math.max(r, g, b);
  const min = v - Math.min(r, g, b);
  const calc = (c: number) => (v - c) / 6 / min + 1 / 2;

  let h: number = 0;
  let s: number = 0;

  if (min === 0) {
    h = 0;
    s = 0;
  } else {
    s = min / v;
    const rr = calc(r);
    const gg = calc(g);
    const bb = calc(b);

    if (r === v) {
      h = bb - gg;
    } else if (g === v) {
      h = 1 / 3 + rr - bb;
    } else if (b === v) {
      h = 2 / 3 + gg - rr;
    }
    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }
  return { h, s, v };
}

// https://stackoverflow.com/questions/17242144/how-to-convert-hsb-hsv-color-to-rgb-accurately
export function hsv2rgb(
  h: number,
  s: number,
  v: number,
): { r: number; g: number; b: number } {
  let r: number, g: number, b: number;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = g = b = 0;
  }
  return { r, g, b };
}
