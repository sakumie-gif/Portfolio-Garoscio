import sharp from "sharp";
import fs from "fs";

// Détourage des icônes : les PNG d'Audrey sont dessinés sur une plaque blanche
// opaque. Posés sur les pastilles colorées (bg-jaune/35, bg-corail/35...), ce
// carré blanc se voit. On repart des originaux 1254px et on reconstruit la
// couche alpha, puis on redescend à 96px (Icone.astro rend au plus à 48px).
//
// Le fond n'est pas blanc pur mais bruité (241-254) : W est le point blanc.
// L'histogramme est nettement bimodal (>=240 : le fond, <200 : l'encre), la
// bande ambiguë entre les deux pèse moins de 1,5% des pixels.
const W = 240;
const SORTIE = 96;

const SRC = "../img/icons";
const DST = "src/assets/icons";

// nom d'import dans Icone.astro -> fichier original
const icones = {
  accessibilite: "icon-accessibilite.png",
  arborescence: "icon-arborescence.png",
  coeur: "icon-coeur.png",
  crayon: "icon-crayon.png",
  email: "icon-email.png",
  envoi: "icon-envoi.png",
  "etoile-scintillante": "icon-etoile-scintillante.png",
  linkedin: "icon-linkedin.png",
  recherche: "icon-recherche.png",
  utilisateurs: "icon-utilisateurs.png",
  wireframe: "icon-wireframe.png",
};

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

for (const [nom, fichier] of Object.entries(icones)) {
  const { data, info } = await sharp(`${SRC}/${fichier}`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const ch = info.channels;
  const out = Buffer.alloc(info.width * info.height * 4);
  let opaques = 0;
  let ecartMax = 0;

  for (let i = 0, o = 0; i < data.length; i += ch, o += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const m = Math.min(r, g, b);

    if (m >= W) {
      // fond : entièrement transparent
      out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
      continue;
    }

    // C = F*a + W*(1-a)  =>  on déduit a de la distance au blanc, puis F.
    const a = (W - m) / W;
    const fr = clamp((r - W * (1 - a)) / a);
    const fg = clamp((g - W * (1 - a)) / a);
    const fb = clamp((b - W * (1 - a)) / a);

    out[o] = fr;
    out[o + 1] = fg;
    out[o + 2] = fb;
    out[o + 3] = clamp(a * 255);
    opaques++;

    // contrôle : recomposité sur le point blanc, on doit retomber sur
    // l'original (à l'arrondi près), sinon l'algèbre est fausse.
    for (const [f, c] of [[fr, r], [fg, g], [fb, b]]) {
      ecartMax = Math.max(ecartMax, Math.abs(f * a + W * (1 - a) - c));
    }
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize(SORTIE, SORTIE, { fit: "inside" })
    .png({ compressionLevel: 9 })
    .toFile(`${DST}/${nom}.png`);

  const pct = ((100 * opaques) / (info.width * info.height)).toFixed(1);
  console.log(
    `${nom.padEnd(22)} encre: ${pct.padStart(5)}%  écart max recomposité: ${ecartMax.toFixed(1)}`,
  );
}
