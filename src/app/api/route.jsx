import { NextResponse } from "next/server";
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const OPTIMAL_VIEWPORT = {
  width: 1,
  height: 1,
  deviceScaleFactor: 0,
};

const BROWSER_ARGS = [
  ...chromium.args,
  '--disable-gpu',
  '--no-zygote',
  '--single-process',
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-fonts',
  '--disable-images',
  '--disk-cache-size=104857600', // 100MB cache size
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const urlToVisit = searchParams.get('url');
  const ref = searchParams.get('ref') || "https://www.google.com";

  if (!urlToVisit) {
    return NextResponse.json(
      { message: 'Missing URL parameter' },
      { status: 400 }
    );
  }

  let browser;
  try {
    const executablePath = await chromium.executablePath();
    browser = await puppeteerCore.launch({
      executablePath,
      args: BROWSER_ARGS,
      userDataDir: '/tmp/chrome-pupet',
      headless: chromium.headless,
      defaultViewport: OPTIMAL_VIEWPORT,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    await page.setExtraHTTPHeaders({ 'Referer': ref });
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      const allowedResources = ['document', 'script', 'xhr', 'fetch'];
      if (allowedResources.includes(req.resourceType())) {
        // Continue requests without modification to allow caching
        req.continue();
      } else {
        req.abort();
      }
    });

    await page.goto(urlToVisit, {
      waitUntil: 'networkidle2',
      timeout: 25000,
    });

    const content = await page.content();
    
    return new NextResponse(content, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { message: 'Error generating content' },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}