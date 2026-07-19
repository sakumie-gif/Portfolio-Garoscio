// Analyse ponctuelle de figma-plateau.png : couleurs des pastilles d'icônes,
// des icônes elles-mêmes et des textes, + ratios de contraste WCAG, pour
// décider des couleurs de la reconstruction HTML de la section « Le plateau ».
import sharp from "sharp";

const src = "public/images/figma-plateau.png";
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
console.log("dimensions:", width, "x", height);

const px = (x, y) => {
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2]];
};

const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

// Luminance relative WCAG
const lum = ([r, g, b]) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (c1, c2) => {
  const [l1, l2] = [lum(c1), lum(c2)].sort((a, b) => b - a);
  return ((l1 + 0.05) / (l2 + 0.05)).toFixed(2);
};

// Centres approximatifs des pastilles (fractions de l'image 1760×1132 de la maquette)
const spots = [
  ["crayon (Conception UX/UI)", 0.507, 0.069],
  ["coeur (Sens du service)", 0.236, 0.287],
  ["palette (Direction artistique)", 0.766, 0.296],
  ["organigramme (Gestion de projet)", 0.245, 0.615],
  ["micro (Mise en scène)", 0.752, 0.627],
  ["chrono (Rythme et lisibilité)", 0.507, 0.837],
];

for (const [nom, fx, fy] of spots) {
  const cx = Math.round(fx * width);
  const cy = Math.round(fy * height);
  // Balayage d'un carré autour du centre : pastille = pixel clair saturé le
  // plus fréquent ; icône = pixel le plus sombre "coloré" (pas gris).
  const counts = new Map();
  let darkest = null;
  let darkestLum = 1;
  for (let dy = -45; dy <= 45; dy++) {
    for (let dx = -45; dx <= 45; dx++) {
      if (dx * dx + dy * dy > 45 * 45) continue;
      const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const c = px(x, y);
      const h = hex(c);
      counts.set(h, (counts.get(h) || 0) + 1);
      const l = lum(c);
      const sat = Math.max(...c) - Math.min(...c);
      if (l < darkestLum && sat > 25) {
        darkestLum = l;
        darkest = c;
      }
    }
  }
  const fond = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const fondRgb = [1, 3, 5].map((i) => parseInt(fond.slice(i, i + 2), 16));
  console.log(`\n${nom} — centre (${cx}, ${cy})`);
  console.log("  pastille (couleur dominante):", fond);
  console.log("  icône (pixel le plus sombre saturé):", darkest ? hex(darkest) : "—");
  if (darkest) console.log("  contraste icône/pastille:", ratio(darkest, fondRgb), "(seuil WCAG 1.4.11 : 3:1)");
}

// Textes sous la pastille du crayon : titre (~+68px sous la pastille) puis
// sous-titre (~+100px). On prend le pixel le plus sombre d'une bande.
const scanBande = (nom, fx, fy, demiH) => {
  const cx = Math.round(fx * width);
  const cy = Math.round(fy * height);
  let darkest = [255, 255, 255];
  let darkestLum = 1;
  for (let dy = -demiH; dy <= demiH; dy++) {
    for (let dx = -160; dx <= 160; dx++) {
      const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const c = px(x, y);
      const l = lum(c);
      if (l < darkestLum) {
        darkestLum = l;
        darkest = c;
      }
    }
  }
  const fond = px(Math.round(0.5 * width), Math.round(0.5 * height - 200));
  console.log(`\n${nom}: pixel le plus sombre ${hex(darkest)} — contraste sur fond ${hex(fond)} : ${ratio(darkest, fond)} (seuil texte : 4.5:1)`);
};

console.log("\nfond de page (échantillon coin):", hex(px(4, 4)));
scanBande("titre « Conception UX/UI »", 0.507, 0.129, 14);
scanBande("sous-titre « Recherche, wireframes… »", 0.507, 0.156, 14);
