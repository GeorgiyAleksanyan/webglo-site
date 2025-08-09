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
  const browser = await puppeteer.launch({
    headless: false, // Try non-headless mode (may not work in CI)
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--disable-infobars',
      '--window-size=1280,800'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
  });
  const page = await browser.newPage();
  // Set a realistic user agent (Chrome on Windows)
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });
  // Enable images and disable automation flags
  await page.setJavaScriptEnabled(true);
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  const buffer = await page.screenshot({ type: 'jpeg', quality: 80 });
  const outDir = path.join(process.cwd(), 'webglo-audit-tool', 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outDir, filename), buffer);
  await browser.close();
})();