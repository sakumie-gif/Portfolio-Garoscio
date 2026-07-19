// Recadre figma-coulisses-fleche.png : l'export Figma contient un texte
// « PAST 9A2737 » incrusté sous la flèche. On garde la flèche seule,
// bords transparents rognés, dans un nouveau fichier (l'original est conservé).
import sharp from "sharp";

const src = "public/images/figma-coulisses-fleche.png";
const dst = "public/images/fleche-coulisses.png";

const meta = await sharp(src).metadata();
console.log("source:", meta.width, "x", meta.height);

// Le texte occupe le bas de l'image : on coupe au-dessus (~62 % de la hauteur),
// puis on rogne les bords transparents.
const coupe = Math.round(meta.height * 0.62);
const haut = await sharp(src)
  .extract({ left: 0, top: 0, width: meta.width, height: coupe })
  .png()
  .toBuffer();
await sharp(haut).trim().png().toFile(dst);

const out = await sharp(dst).metadata();
console.log("sortie:", out.width, "x", out.height, "->", dst);
