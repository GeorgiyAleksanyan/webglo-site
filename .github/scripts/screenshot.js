const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];
const filename = process.argv[3] || 'screenshot.jpg';

(async () => {
  if (!url) {
    console.error('No URL provided');
    process.exit(1);
  }
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  const buffer = await page.screenshot({ type: 'jpeg', quality: 80 });
  const outDir = path.join(process.cwd(), 'webglo-audit-tool', 'screenshots');
  fs.writeFileSync(path.join(outDir, filename), buffer);
  await browser.close();
})();