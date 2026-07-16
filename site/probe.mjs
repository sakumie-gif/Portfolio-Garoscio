import sharp from 'sharp';
import fs from 'fs';
const dir = 'src/assets/icons';
for (const f of fs.readdirSync(dir)) {
  const img = sharp(`${dir}/${f}`);
  const meta = await img.metadata();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x,y) => { const i=(y*info.width+x)*info.channels; return [data[i],data[i+1],data[i+2],data[i+3]].join(','); };
  console.log(f.padEnd(28), (meta.width+'x'+meta.height).padEnd(11), 'ch:'+meta.channels, 'alpha:'+String(meta.hasAlpha).padEnd(5),
    '| corner', px(0,0), '| midtop', px(Math.floor(info.width/2), 2));
}
