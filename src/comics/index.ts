/**
 * Write script based on these instructions
 * 
 * This a script to create PDF for comics.
 * 
 * technology used:
 * - node.js
 * - typescript
 * - yarn
 *
 * We are not able to scrape the website directly because it is using javascript to load the images.
 *  
 * 
 * It works as follows:
 * 1. Go to the first page of the comic, such as 
 * https://mangadex.org/chapter/2e22407f-4628-4559-88c8-bb76eea7aaf1/1
 * 2. This page will contain image with css selector "img data-v-824c3600"
 * 3. Download the image and save it to a temporary folder
 * 4. Go to the next page, such as
 * https://mangadex.org/chapter/2e22407f-4628-4559-88c8-bb76eea7aaf1/2
 * 5. Repeat steps 2-4 until there are no more pages
 * 
 * Make sure to write different fucntions for each task
 * Log all the steps
 * Make sure to open Chrome browser while executing the script
 * Do not close browser if there is an error
*/

import puppeteer, {Page} from 'puppeteer';
import fs from 'fs';
import { promisify } from 'util';
import PDFDocument from 'pdfkit';
import https from 'https';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);


async function downloadComicImages(comicUrl: string) {
  let browser;
  try {
    console.log('Starting the comic download process...');
    browser = await puppeteer.launch({ headless: false }); // Change to true if you don't want to see the browser
    const page: Page = await browser.newPage();
    await page.goto(comicUrl);

    let pageNumber = 1;
    while (true && pageNumber < 5) {
      console.log(`Downloading page ${pageNumber}...`);
      // Wait until the image element is present
      await page.waitForSelector('img[data-v-824c3600]');
      await page.waitForSelector('.reader-progress-wrap');
      await removeElement(page, '.reader-progress-wrap'); // Remove the progress bar
      const imageSrc = await page.$eval('img[data-v-824c3600]', (img) => (img as HTMLImageElement).src);

      console.log('Image source:', imageSrc);
      if (!imageSrc) {
        console.log('No more pages found. Exiting...');
        break;
      }

      const imageBuffer = await page.screenshot({ type: 'png' });
      await saveImage(imageBuffer, pageNumber);

      console.log(`Page ${pageNumber} downloaded.`);

      pageNumber++;
      await page.goto(`${comicUrl}/${pageNumber}`);
    }

    console.log('All pages downloaded successfully.');
  } catch (error) {
    console.error('Error during comic download:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function removeElement(page: Page, selector: string): Promise<void> {
    await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        elements.forEach(element => {
          console.log('Removing element:', element);
            element.remove();
        });
    }, selector);
}


async function saveImage(imageBuffer: Buffer, pageNumber: number) {
  const directory = './temp';
  const filePath = `${directory}/page_${pageNumber}.png`;
  
  try {
    await mkdir(directory, { recursive: true });
    await writeFile(filePath, imageBuffer);
  } catch (error) {
    console.error('Error saving image:', error);
  }
}


async function combineImagesIntoPDF(directory: string, outputFilePath: string) {
  try {
    const files = await readdir(directory);
    const A4_WIDTH_PIXELS = 595;
    const A4_HEIGHT_PIXELS = 842;
    const MARGIN_TOP_PIXELS = 20; // Example margin top in pixels
    const MARGIN_BOTTOM_PIXELS = 20; // Example margin bottom in pixels
    const MARGIN_LEFT_PIXELS = 20; // Example margin left in pixels
    const MARGIN_RIGHT_PIXELS = 20; // Example margin right in pixels

    const usableWidth = A4_WIDTH_PIXELS - MARGIN_LEFT_PIXELS - MARGIN_RIGHT_PIXELS;
    const usableHeight = A4_HEIGHT_PIXELS - MARGIN_TOP_PIXELS - MARGIN_BOTTOM_PIXELS;

    
    if (files.length === 0) {
      console.log('No images found in the directory.');
      return;
    }

    const pdfStream = fs.createWriteStream(outputFilePath);
    const pdf = new PDFDocument({ autoFirstPage: false });

    pdf.pipe(pdfStream);

    for (let i = 0; i < files.length; i++) {
      const imagePath = `${directory}/${files[i]}`;
      if (imagePath.endsWith('.png')) {
        // pdf.addPage({ size: [595, 842] }); // A4 size in pixels
        pdf.addPage({ size: [usableWidth, usableHeight] });
        pdf.image(imagePath, 0, 0, { width: 595 });
      }
    }

    pdf.end();

    console.log(`PDF file created successfully: ${outputFilePath}`);
  } catch (error) {
    console.error('Error combining images into PDF:', error);
  }
}

// Example usage:
const comicUrl = 'https://mangadex.org/chapter/046fec34-0e88-4f42-9f42-164a0d94f90a';
downloadComicImages(comicUrl).then(() => {
  const inputDirectory = './temp';
  const outputPDFPath = `${inputDirectory}/comic.pdf`;
  combineImagesIntoPDF(inputDirectory, outputPDFPath);
})