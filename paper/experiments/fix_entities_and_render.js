const fs = require('fs');
const path = require('path');
const { Resvg } = require(path.resolve(__dirname, '../../backend/node_modules/@resvg/resvg-js'));

const figuresDir = path.resolve(__dirname, '../figures');

// 1. Fix SVG files
const files = fs.readdirSync(figuresDir).filter(f => f.endsWith('.svg'));
files.forEach(f => {
  const p = path.join(figuresDir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/&rarr;/g, '&#8594;');
  fs.writeFileSync(p, content, 'utf8');
});
console.log('Fixed SVG entities.');

// 2. Render to PNG
files.forEach(file => {
  const svgPath = path.join(figuresDir, file);
  const pngPath = path.join(figuresDir, file.replace('.svg', '.png'));
  const svgContent = fs.readFileSync(svgPath);

  const resvg = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: 1800 }
  });
  const pngData = resvg.render();
  fs.writeFileSync(pngPath, pngData.asPng());
  console.log(`Rendered PNG: ${path.basename(pngPath)} (${Math.round(pngData.asPng().length / 1024)} KB)`);
});

console.log('All PNG figures rendered successfully!');
