import sharp from 'sharp';
import fs from 'fs';
const dir = '../img/icons';
for (const f of fs.readdirSync(dir)) {
  const m = await sharp(`${dir}/${f}`).metadata();
  const kb = (fs.statSync(`${dir}/${f}`).size/1024).toFixed(0);
  console.log(f.padEnd(32), (m.width+'x'+m.height).padEnd(11), 'ch:'+m.channels, 'alpha:'+String(m.hasAlpha).padEnd(6), kb+'Ko');
}
