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
const ENCRE = [0x1e, 0x1c, 0x1c]; // --color-encre

const SRC = "../img/icons";
const DST = "src/assets/icons";

// Les icônes posées sur un aplat coloré à côté de texte encre passent en encre :
// c'est la règle écrite dans index.astro (« l'icône posée dessus est encre,
// jamais corail ») et la seule teinte qui tienne AA sur les neuf tons de
// l'échelle. Celles qui accompagnent du texte text-accent (etoile en surtitre,
// email et linkedin en page contact) gardent leur couleur : elles s'accordent
// à leur libellé. coeur n'est utilisée nulle part, on la laisse telle quelle.
//
// nom d'import dans Icone.astro -> [fichier original, passer en encre ?]
const icones = {
  accessibilite: ["icon-accessibilite.png", true],
  arborescence: ["icon-arborescence.png", true],
  coeur: ["icon-coeur.png", false],
  crayon: ["icon-crayon.png", true],
  email: ["icon-email.png", false],
  envoi: ["icon-envoi.png", true],
  "etoile-scintillante": ["icon-etoile-scintillante.png", false],
  linkedin: ["icon-linkedin.png", false],
  recherche: ["icon-recherche.png", true],
  utilisateurs: ["icon-utilisateurs.png", true],
  wireframe: ["icon-wireframe.png", true],
};

for (const [nom, [fichier, enEncre]] of Object.entries(icones)) {
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
  const teinte = enEncre ? ENCRE : S;
  const out = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0, o = 0; i < data.length; i += ch, o += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (Math.min(r, g, b) >= W) continue; // fond : laissé à 0,0,0,0
    const a = Math.min(1, dist(r, g, b) / normeS);
    out[o] = teinte[0];
    out[o + 1] = teinte[1];
    out[o + 2] = teinte[2];
    out[o + 3] = Math.round(a * 255);
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize(SORTIE, SORTIE, { fit: "inside" })
    .png({ compressionLevel: 9 })
    .toFile(`${DST}/${nom}.png`);

  console.log(
    `${nom.padEnd(22)} encre rgb(${S.join(",")})`.padEnd(48) +
      (enEncre ? `-> encre` : `-> conservée`),
  );
}
