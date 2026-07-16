import sharp from 'sharp';
const W = 240;
const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
for (const f of ['coeur','wireframe','utilisateurs','arborescence']) {
  const { data, info } = await sharp(`../img/icons/icon-${f}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const ch = info.channels;
  let n=0, sum=0, gt4=0, gt10=0, inkGt4=0;
  for (let i=0;i<data.length;i+=ch){
    const r=data[i],g=data[i+1],b=data[i+2], m=Math.min(r,g,b);
    if (m>=W) continue;
    const a=(W-m)/W;
    let e=0;
    for (const c of [r,g,b]) {
      const fc = clamp((c - W*(1-a))/a);
      e = Math.max(e, Math.abs(fc*a + W*(1-a) - c));
    }
    n++; sum+=e; if(e>4){gt4++; if(a>0.5) inkGt4++;} if(e>10) gt10++;
  }
  const tot = info.width*info.height;
  console.log(f.padEnd(14), 'ink px:',String(n).padStart(7), '| err moy', (sum/n).toFixed(2),
    '| err>4:', gt4, `(${(100*gt4/tot).toFixed(3)}% img)`, '| err>10:', gt10, '| dont opaques(a>.5):', inkGt4);
}
