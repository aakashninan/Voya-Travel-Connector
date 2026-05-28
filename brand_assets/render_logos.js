const fs = require('fs');
const path = require('path');
const svg2img = require('../backend/node_modules/svg2img');

const assetsDir = __dirname;

const targets = [
  {
    svg: 'voya_logo_terracotta.svg',
    png: 'voya_logo_orange.png',
    jpg: 'voya_logo_orange.jpg'
  },
  {
    svg: 'voya_logo_dark.svg',
    png: 'voya_logo_dark.png',
    jpg: 'voya_logo_dark.jpg'
  },
  {
    svg: 'voya_logo_transparent.svg',
    png: 'voya_logo_transparent.png'
  }
];

function renderFile(target) {
  return new Promise((resolve, reject) => {
    const svgPath = path.join(assetsDir, target.svg);
    if (!fs.existsSync(svgPath)) {
      return reject(new Error(`File not found: ${svgPath}`));
    }
    const svgString = fs.readFileSync(svgPath, 'utf8');

    // 1. Render to PNG (1000x1000px)
    svg2img(svgString, { width: 1000, height: 1000, format: 'png' }, function(err, buffer) {
      if (err) return reject(err);
      
      const pngPath = path.join(assetsDir, target.png);
      fs.writeFileSync(pngPath, buffer);
      console.log(`✓ Rendered PNG: ${target.png}`);

      // 2. Render to JPEG if required
      if (target.jpg) {
        svg2img(svgString, { width: 1000, height: 1000, format: 'jpeg' }, function(err, jpgBuffer) {
          if (err) return reject(err);
          const jpgPath = path.join(assetsDir, target.jpg);
          fs.writeFileSync(jpgPath, jpgBuffer);
          console.log(`✓ Rendered JPG: ${target.jpg}`);
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  console.log('Starting mathematically correct logo rendering from SVGs...');
  for (const t of targets) {
    try {
      await renderFile(t);
    } catch (e) {
      console.error(`✗ Error rendering ${t.svg}:`, e.message);
    }
  }
  console.log('Logo rendering complete!');
}

main();
