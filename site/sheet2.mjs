import sharp from 'sharp';
// Appariements RÉELS icône/pastille, aux tailles réelles (56px pastille, icône 26px)
const REELS = [
  ['recherche',   'brume/35',  [241,243,242]],
  ['arborescence','jaune/35',  [249,238,198]],
  ['crayon',      'corail/35', [249,201,195]],
  ['utilisateurs','corail/15', [250,229,225]],
  ['envoi',       'brume/15',  [247,247,245]],
];
const P = 56, IC = 26, GAP = 14, SC = 4; // SC : agrandissement pour l'inspection
const tiles = [];
for (let r = 0; r < REELS.length; r++) {
  const [nom, , rgb] = REELS[r];
  for (const [k, apres] of [[0,false],[1,true]]) {
    const src = apres ? `src/assets/icons/${nom}.png` : `../img/icons/icon-${nom}.png`;
    const ic = await sharp(src).resize(IC*SC, IC*SC, {fit:'inside'}).png().toBuffer();
    const tile = await sharp({create:{width:P*SC,height:P*SC,channels:4,background:{r:rgb[0],g:rgb[1],b:rgb[2],alpha:1}}})
      .composite([{input: ic, gravity:'centre'}]).png().toBuffer();
    tiles.push({input: tile, left: k*(P*SC+GAP), top: r*(P*SC+GAP)});
  }
}
await sharp({create:{width:2*(P*SC+GAP),height:REELS.length*(P*SC+GAP),channels:4,background:{r:252,g:250,b:247,alpha:1}}})
  .composite(tiles).png().toFile('sheet2.png');
console.log('gauche = AVANT, droite = APRÈS |', REELS.map(r=>`${r[0]} sur ${r[1]}`).join(' / '));
