import sharp from "sharp";

// Détourage des icônes. Les PNG d'Audrey sont dessinés sur une plaque blanche
// opaque, sans couche alpha : posés sur les pastilles colorées, ce carré blanc
// se voyait. On repart des originaux 1254px de img/icons/ (et non des copies
// déjà réduites) pour reconstruire l'alpha sur des bords nets, puis on redescend
// à 96px — Icone.astro rend au plus à 48px (taille 24, densities [1,2]).
//
// Le fond n'est pas blanc pur mais bruité (241-254) : W est le point blanc.
// L'histogramme est franchement bimodal — le fond au-dessus de 240, l'encre
// sous 200 — et la bande ambiguë entre les deux pèse moins de 1,5% des pixels.
//
// Chaque icône est un tracé monochrome (dispersion mesurée à 3-4 sur 255 dans
// le décile le plus encré). On exploite ça : plutôt que de dématricer pixel à
// pixel, on estime la couleur d'encre S, puis l'alpha est le taux de couverture
// le long du segment blanc -> S. Un trait plein ressort ainsi à alpha 1, là où
// un dématriçage naïf laissait le corail plein à 82% d'opacité et laissait la
// pastille transparaître au travers.
const W = 240;
const SORTIE = 96;
// Les deux seules teintes que peut porter une icône : aucune ne sort du thème.
const ENCRE = [0x1e, 0x1c, 0x1c]; // --color-encre
const ACCENT = [0xc4, 0x3d, 0x30]; // --color-accent, le seul rouge de la palette

// Normalisation optique. Chaque original entoure son tracé d'une marge qui lui
// est propre : la couverture d'encre allait de 2.8% (coeur) à 16.9% (linkedin).
// Redimensionner le canevas entier laissait donc chaque icône à une taille
// apparente différente, et les pastilles du processus semblaient dépareillées
// alors que leurs boîtes font toutes 56px. On recadre sur la boîte englobante
// de l'encre, puis on la remet à l'échelle sur une cible commune : c'est le
// tracé qui est calibré, plus le canevas.
const CIBLE = 84; // côté max du tracé dans le canevas de 96 -> marge égale pour tous
const SEUIL_ALPHA = 12; // en deçà, c'est de l'antialiasing, pas le tracé

const SRC = "../img/icons";
const DST = "src/assets/icons";

// AUCUNE icône ne garde sa couleur d'origine. Les originaux sont dessinés dans
// des teintes sans rapport entre elles — arborescence est orange (253,177,20),
// envoi bleu (86,122,143), linkedin gris (61,66,72), et coeur/email/etoile dans
// un corail (253,82,63) qui n'appartient plus à la palette. Les conserver, c'est
// rouvrir l'arc-en-ciel par la petite porte et réintroduire un second rouge.
//
// Chaque icône est donc reteinte dans la couleur de son libellé, pour former un
// seul objet avec lui :
//   accent — celles posées à côté d'un texte text-accent (surtitres, contact)
//   encre  — celles posées sur un aplat, à côté d'un texte encre (tuiles, tags)
//
// nom d'import dans Icone.astro -> [fichier original, teinte cible]
const icones = {
  accessibilite: ["icon-accessibilite.png", ENCRE],
  arborescence: ["icon-arborescence.png", ENCRE],
  coeur: ["icon-coeur.png", ACCENT],
  crayon: ["icon-crayon.png", ENCRE],
  email: ["icon-email.png", ACCENT],
  envoi: ["icon-envoi.png", ENCRE],
  "etoile-scintillante": ["icon-etoile-scintillante.png", ACCENT],
  linkedin: ["icon-linkedin.png", ACCENT],
  recherche: ["icon-recherche.png", ENCRE],
  utilisateurs: ["icon-utilisateurs.png", ENCRE],
  wireframe: ["icon-wireframe.png", ENCRE],
};

for (const [nom, [fichier, cible]] of Object.entries(icones)) {
  const { data, info } = await sharp(`${SRC}/${fichier}`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const ch = info.channels;
  const dist = (r, g, b) => Math.hypot(W - r, W - g, W - b);

  // 1. Estimer la couleur d'encre : moyenne du décile le plus éloigné du blanc.
  const encres = [];
  for (let i = 0; i < data.length; i += ch) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (Math.min(r, g, b) < W) encres.push([dist(r, g, b), r, g, b]);
  }
  encres.sort((a, b) => b[0] - a[0]);
  const decile = encres.slice(0, Math.max(1, Math.floor(encres.length * 0.1)));
  const S = [1, 2, 3].map((k) =>
    Math.round(decile.reduce((s, p) => s + p[k], 0) / decile.length),
  );

  // Garde-fou : si le décile est dispersé, l'icône n'est pas monochrome et
  // l'aplatir écraserait une nuance. Mieux vaut le savoir que le découvrir.
  const dispersion = Math.sqrt(
    decile.reduce(
      (s, p) => s + [1, 2, 3].reduce((q, k) => q + (p[k] - S[k - 1]) ** 2, 0) / 3,
      0,
    ) / decile.length,
  );
  if (dispersion > 30) {
    console.warn(`  /!\\ ${nom} : dispersion ${dispersion.toFixed(0)}, icône non monochrome`);
  }

  // 2. Alpha = taux de couverture le long du segment blanc -> S.
  const normeS = dist(S[0], S[1], S[2]);
  const teinte = cible;
  const out = Buffer.alloc(info.width * info.height * 4);

  // Le canevas ENTIER est peint dans la teinte cible, fond compris : seul
  // l'alpha distingue le tracé du vide. Laisser le fond à rgb(0,0,0) le faisait
  // saigner sur les bords au rééchantillonnage, et l'encre y dérivait jusqu'à
  // 18/255 de sa cible. Ici l'image est monochrome par construction : aucune
  // interpolation ne peut inventer une couleur qui ne soit pas la teinte.
  for (let o = 0; o < out.length; o += 4) {
    out[o] = teinte[0];
    out[o + 1] = teinte[1];
    out[o + 2] = teinte[2];
  }

  // 3. Boîte englobante du tracé, calculée dans la même passe.
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;

  for (let i = 0, o = 0; i < data.length; i += ch, o += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (Math.min(r, g, b) >= W) continue; // fond : alpha laissé à 0
    const a = Math.min(1, dist(r, g, b) / normeS);
    const alpha = Math.round(a * 255);
    out[o + 3] = alpha;

    if (alpha >= SEUIL_ALPHA) {
      const p = o / 4;
      const x = p % info.width;
      const y = (p - x) / info.width;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }

  if (x1 < 0) throw new Error(`${nom} : aucun pixel d'encre, détourage impossible`);

  const largeur = x1 - x0 + 1;
  const hauteur = y1 - y0 + 1;
  // Mise à l'échelle sur le côté le plus long : un logo large (linkedin) et un
  // logo carré (recherche) occupent alors la même emprise optique.
  const k = CIBLE / Math.max(largeur, hauteur);
  const l = Math.max(1, Math.round(largeur * k));
  const h = Math.max(1, Math.round(hauteur * k));

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left: x0, top: y0, width: largeur, height: hauteur })
    .resize(l, h)
    .extend({
      // Centre le tracé sur le canevas commun. Les restes impairs vont en bas
      // et à droite : un décalage d'un pixel sur 96, invisible au rendu.
      top: Math.floor((SORTIE - h) / 2),
      bottom: Math.ceil((SORTIE - h) / 2),
      left: Math.floor((SORTIE - l) / 2),
      right: Math.ceil((SORTIE - l) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(`${DST}/${nom}.png`);

  console.log(
    `${nom.padEnd(22)} rgb(${S.join(",")})`.padEnd(40) +
      `tracé ${String(largeur).padStart(4)}x${String(hauteur).padStart(4)} -> ${l}x${h}  ` +
      (cible === ENCRE ? "encre" : "accent"),
  );
}
