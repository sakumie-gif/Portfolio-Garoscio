import sharp from 'sharp';
// pastilles réelles, composités sur ivoire #fcfaf7
const BGS = [
  ['jaune/35',  [249,238,198]],
  ['corail/35', [249,201,195]],
  ['brume/35',  [241,243,242]],
];
const NOMS = ['recherche','arborescence','crayon','utilisateurs','envoi','etoile-scintillante','wireframe','accessibilite','email','coeur','linkedin'];
const T = 64, IC = 40, PAD = 6;
const cols = [];
// pour chaque bg : colonne AVANT (original 96px opaque) puis APRES (détouré)
const tiles = [];
for (let r = 0; r < NOMS.length; r++) {
  for (let c = 0; c < BGS.length; c++) {
    for (const [k, apres] of [[0,false],[1,true]]) {
      const src = apres ? `src/assets/icons/${NOMS[r]}.png` : `../img/icons/icon-${NOMS[r]}.png`;
      const ic = await sharp(src).resize(IC, IC, {fit:'inside'}).png().toBuffer();
      const tile = await sharp({create:{width:T,height:T,channels:4,background:{r:BGS[c][1][0],g:BGS[c][1][1],b:BGS[c][1][2],alpha:1}}})
        .composite([{input: ic, gravity:'centre'}]).png().toBuffer();
      tiles.push({input: tile, left: (c*2+k)*(T+PAD), top: r*(T+PAD)});
    }
  }
}
const Wd = BGS.length*2*(T+PAD), Ht = NOMS.length*(T+PAD);
await sharp({create:{width:Wd,height:Ht,channels:4,background:{r:252,g:250,b:247,alpha:1}}})
  .composite(tiles).png().toFile('sheet.png');
console.log('ok', Wd+'x'+Ht, '| colonnes: avant/après ×', BGS.map(b=>b[0]).join(', '));
