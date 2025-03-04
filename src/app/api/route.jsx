import {
  NextResponse
} from "next/server";
//import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
//import chromium from '@sparticuz/chromium-min';
import chromium from '@sparticuz/chromium';
// const chromium = require("@sparticuz/chromium");

/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-unused-vars */


export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const OPTIMAL_VIEWPORT = {
  width: 1,
  height: 1,
  deviceScaleFactor: 0,
};

export async function GET(request) {
  const {
    searchParams
  } = new URL(request.url);
  const urlToVisit = searchParams.get('url');
  const ref = searchParams.get('ref') || "https://www.google.com";

  if (!urlToVisit) {
    return NextResponse.json({
      message: 'Missing URL parameter'
    }, {
      status: 400
    });
  }

  try {
    const executablePath = await chromium.executablePath()
    const browser = await puppeteerCore.launch({
      executablePath,
      args: [
        ...chromium.args,
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
        '--disable-dev-shm-usage',
      ],
      headless: chromium.headless,
      defaultViewport: OPTIMAL_VIEWPORT,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Referer': ref
    });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const allowedResources = ['document', 'script', 'xhr', 'fetch'];
      allowedResources.includes(req.resourceType()) 
        ? req.continue() 
        : req.abort();
    });
    await page.goto(urlToVisit, {
      waitUntil: 'networkidle0'
    });

    /*
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '10px',
                bottom: '10px',
                left: '20px'
            }
        });
        */

    //await page.waitForSelector('video')

    // Extract the video source URL
    /*
    const videoSrc = await page.evaluate(() => {
      const video = document.querySelector('video')
      if (!video) {
        throw new Error('Video element not found')
      }
      return video.src
    })
    //const video = await page.$eval("video", n => n.getAttribute("src"))
    */
    /*
    const ss = await page.screenshot({
      path: '/tmp/ss.png',
      fullPage: true
    });
    */
    const content = await page.content()

    await browser.close();

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      },

    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      {
        message: 'Error generating'
      },
      {
        status: 500
      }
    );
  }
}