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
import fs, { Dirent } from 'fs';
import { promisify } from 'util';
import PDFDocument from 'pdfkit';
import https from 'https';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);


async function downloadComicImages(comicUrl: string, directory: string){
  let browser;
  try {
    console.log('Starting the comic download process...');
    browser = await puppeteer.launch({ headless: true }); // Change to true if you don't want to see the browser
    const page: Page = await browser.newPage();
    await page.goto(comicUrl);

    let pageNumber = 1;
    let volumeChapter: String | null = '';
    let pageOfpages: String | null = null;
    let isLastPage = false
    while (!isLastPage) {
      console.log('............................................')
      console.log(`Downloading page ${pageNumber}...`);
      // Wait until the image element is present
      // wait for 1 second
      await page.waitForNavigation({ timeout: 5000 });
      await page.waitForSelector('img[data-v-824c3600][data-v-cd1c09d1].img.sp.limit-width.limit-height.mx-auto');
      await page.waitForSelector('.reader-progress-wrap');
      await page.waitForSelector('.reader--meta.chapter');
      await page.waitForSelector('.reader--meta.page');

      volumeChapter = await page.$eval('.reader--meta.chapter', el => el.textContent) ?? '';
      const partsChapter = volumeChapter.split(',');
      const volume = partsChapter[0].replace('Vol. ', '').trim();
      const chapter = partsChapter[1].replace('Ch. ', '').trim();

      console.log('Chapter:', volumeChapter);
      pageOfpages = await page.$eval('.reader--meta.page', el => el.textContent) ?? '';

      const parts = pageOfpages.split('/');
      const currentPage = parseInt(parts[0].replace('Pg. ', '').trim());
      const totalPages = parseInt(parts[1].trim());

      if (currentPage === totalPages) {
        isLastPage = true;
      }

      if (currentPage === 1) {
        volumeChapter = volumeChapter?.trim().replace('Chapter: ', '') ?? '';
      }

      console.log('Current page:', currentPage);
      console.log('Total pages:', totalPages);

      const inputDirectory = `./${directory}/${volume}`;
      console.log('Input directory:', inputDirectory);

      await removeElement(page, '.reader-progress-wrap'); // Remove the progress bar
      const imageSrc = await page.$eval('img[data-v-824c3600]', (img) => (img as HTMLImageElement).src);

      console.log('Image source:', imageSrc);
      if (!imageSrc) {
        console.log('No more pages found. Exiting...');
        break;
      }

      const imageBuffer = await page.screenshot({ type: 'png' });
      await saveImage(imageBuffer, volume, chapter, pageNumber, inputDirectory);

      console.log(`Page ${pageNumber} downloaded.`);

      pageNumber++;
      var url = `${comicUrl}/${pageNumber}`
      console.log('Navigating to:', url);
      await page.goto(url);
    }
    console.log('All pages downloaded successfully.');
    return volumeChapter;
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


async function saveImage(
  imageBuffer: Buffer, 
  volume: string,
  chapter: string,
  pageNumber: number, 
  directory: string) 
  {
    const paddedPageNumber = String(pageNumber).padStart(3, '0');
    const filePath = `${directory}/${volume}_${chapter}_${paddedPageNumber}.png`;
     
    try {
      await mkdir(directory, { recursive: true });
      await writeFile(filePath, imageBuffer);
    } catch (error) {
      console.error('Error saving image:', error);
    }
}


async function combineImagesIntoPDF(directory: string, outputFilePath: string) {
  console.debug('............................................')
  console.log(`Combining images into PDF from ${directory}...`);
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

interface Chapter {
    chapter: string;
    id: string;
    others: string[];
    count: number;
}

interface Volume {
    volume: string;
    count: number;
    chapters: { [chapterNumber: string]: Chapter };
}

interface Result {
    result: string;
    volumes: { [volumeNumber: string]: Volume };
}

let chapterIds: string[] = [];
let volumesNumbers: string[] = [];

fs.readFile('src/comics/chapters.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        const jsonData: Result = JSON.parse(data);

        // Iterate over volumes
        for (const volumeKey in jsonData.volumes) {
            const volume = jsonData.volumes[volumeKey];

            // Check if the volume number is within the range 15 to 20
            const volumeNumber = parseInt(volume.volume);
            if (volumeNumber >= 15 && volumeNumber <= 15) {
                // Iterate over chapters
                for (const chapterKey in volume.chapters) {
                    const chapter = volume.chapters[chapterKey];
                    // Collect the id of each chapter
                    chapterIds.push(chapter.id);
                }
                volumesNumbers.push(volume.volume);
            }
        }

        console.log(chapterIds); 
        downloadVolume(chapterIds).then(() => {
            console.log('All volumes downloaded successfully.');
            volumesNumbers.forEach((volume) => {
              const inputDirectory = `temp/${volume}`;
              const outputDirectory = `temp`;
              const outputPDFPath = `${outputDirectory}/${volume}.pdf`;
              combineImagesIntoPDF(inputDirectory, outputPDFPath);
            });
        });

    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
});

async function downloadVolume(chapterIds: string[]) {
  for (const chapter of chapterIds) {
    const comicUrl = `https://mangadex.org/chapter/${chapter}`;
    const directory = `temp`;
    await downloadComicImages(
      comicUrl, 
      directory,
    )
    // .then((chapterName) => {
      // const inputDirectory = `./${directory}/${chapterName}`;
      // const outputPDFPath = `${directory}/${chapterName}.pdf`;
      // combineImagesIntoPDF(inputDirectory, outputPDFPath);
    // });
  }
}
