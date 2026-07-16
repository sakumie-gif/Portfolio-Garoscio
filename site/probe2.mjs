import sharp from 'sharp';
import fs from 'fs';
const dir = 'src/assets/icons';
for (const f of fs.readdirSync(dir)) {
  const { data, info } = await sharp(`${dir}/${f}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const counts = new Map();
  let minL = 255, minPx = null, sat = 0;
  for (let i = 0; i < data.length; i += ch) {
    const [r,g,b] = [data[i],data[i+1],data[i+2]];
    const L = 0.2126*r + 0.7152*g + 0.0722*b;
    if (L < minL) { minL = L; minPx = [r,g,b]; }
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
    if (mx - mn > 25) sat++;
    const bucket = `${r>>5},${g>>5},${b>>5}`;
    counts.set(bucket, (counts.get(bucket)||0)+1);
  }
  const total = data.length/ch;
  const top = [...counts].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}:${(100*v/total).toFixed(0)}%`);
  console.log(f.padEnd(28), 'darkest', String(minPx).padEnd(12), 'L='+minL.toFixed(0).padEnd(4),
    'colored px:', (100*sat/total).toFixed(1)+'%', '| top buckets', top.join(' '));
}
