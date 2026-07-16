import sharp from 'sharp';
import fs from 'fs';
const dir = 'src/assets/icons';
for (const f of fs.readdirSync(dir)) {
  const { data, info } = await sharp(`${dir}/${f}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const bins = { '<200':0, '200-219':0, '220-229':0, '230-234':0, '235-239':0, '240-244':0, '245-249':0, '250+':0 };
  for (let i = 0; i < data.length; i += ch) {
    const m = Math.min(data[i], data[i+1], data[i+2]);
    if (m < 200) bins['<200']++;
    else if (m < 220) bins['200-219']++;
    else if (m < 230) bins['220-229']++;
    else if (m < 235) bins['230-234']++;
    else if (m < 240) bins['235-239']++;
    else if (m < 245) bins['240-244']++;
    else if (m < 250) bins['245-249']++;
    else bins['250+']++;
  }
  const t = data.length/ch;
  console.log(f.padEnd(28), Object.entries(bins).map(([k,v])=>`${k}:${(100*v/t).toFixed(1)}`).join(' '));
}
