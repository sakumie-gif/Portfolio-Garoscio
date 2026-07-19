// Analyse ponctuelle de figma-plateau-radar.png : couleurs + position des
// sommets (points sombres), pour reconstruire le radar en SVG net.
import sharp from "sharp";

const src = "public/images/figma-plateau-radar.png";
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const px = (x, y) => {
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};

console.log("dimensions:", width, "x", height);
console.log("coin haut-gauche:", px(2, 2));
console.log("coin bas-droit:", px(width - 3, height - 3));
console.log("centre:", px(Math.round(width / 2), Math.round(height / 2)));
console.log("mi-hauteur gauche:", px(10, Math.round(height / 2)));

// Points sombres (sommets) : luminance faible, alpha plein
const dark = [];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const [r, g, b, a] = px(x, y);
    if (a > 200 && r < 80 && g < 80 && b < 80) dark.push([x, y]);
  }
}
// Regroupement grossier des pixels sombres en clusters
const clusters = [];
for (const [x, y] of dark) {
  let c = clusters.find((c) => Math.abs(c.x / c.n - x) < 8 && Math.abs(c.y / c.n - y) < 8);
  if (c) { c.x += x; c.y += y; c.n++; }
  else clusters.push({ x, y, n: 1 });
}
const dots = clusters
  .filter((c) => c.n > 20)
  .map((c) => [Math.round(c.x / c.n), Math.round(c.y / c.n), c.n]);
console.log("clusters sombres (x, y, taille):");
for (const d of dots) console.log(" ", d.join(", "));

// Couleur du trait du polygone : échantillon entre deux sommets probables
if (dots.length >= 2) {
  const [x1, y1] = dots[0];
  const [x2, y2] = dots[1];
  const mx = Math.round((x1 + x2) / 2);
  const my = Math.round((y1 + y2) / 2);
  console.log("milieu segment sommets 0-1:", mx, my, px(mx, my));
}
