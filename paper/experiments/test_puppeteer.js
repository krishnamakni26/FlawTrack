const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../backend/node_modules/puppeteer-core'));

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent('<h1>Test PDF</h1><p>Working properly.</p>');
    const pdfPath = path.resolve(__dirname, '../test.pdf');
    await page.pdf({ path: pdfPath, format: 'Letter' });
    await browser.close();
    console.log('Successfully generated test PDF at:', pdfPath);
  } catch (err) {
    console.error('Puppeteer test error:', err);
  }
})();
