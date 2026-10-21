const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../backend/node_modules/puppeteer-core'));

async function rasterize() {
  const pdfPath = path.resolve(__dirname, '../FlawTrack_Paper.pdf');
  const outDir = path.resolve(__dirname, '../format_check');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const html = `<!DOCTYPE html>
  <html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    </script>
  </head>
  <body>
    <div id="pages"></div>
    <script>
      async function renderAll() {
        const raw = atob('${pdfBase64}');
        const uint8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) {
          uint8Array[i] = raw.charCodeAt(i);
        }
        
        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        const pdf = await loadingTask.promise;
        const pageCount = pdf.numPages;
        const images = [];

        for (let p = 1; p <= pageCount; p++) {
          const page = await pdf.getPage(p);
          const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for crisp inspection
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          images.push({ pageNum: p, dataUrl: canvas.toDataURL('image/png') });
        }
        return images;
      }
    </script>
  </body>
  </html>`;

  await page.setContent(html);
  console.log('Rendering PDF pages in browser via PDF.js...');
  const images = await page.evaluate(async () => {
    return await renderAll();
  });

  for (const img of images) {
    const base64Data = img.dataUrl.replace(/^data:image\/png;base64,/, '');
    const outPath = path.join(outDir, `page_${img.pageNum}.png`);
    fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
    console.log(`Saved ${outPath}`);
  }

  await browser.close();
  console.log(`Successfully rasterized ${images.length} pages to ${outDir}`);
}

rasterize().catch(console.error);
