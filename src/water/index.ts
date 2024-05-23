// index.ts

import * as nodemailer from 'nodemailer';
import * as yargs from 'yargs';
import * as dotenv from 'dotenv';
import { generateEmailBody } from './emailContent';
import * as fs from 'fs';


dotenv.config();

const argv = yargs
  .options({
    to: { type: 'string', demandOption: true },
    'billing-start': { type: 'string', demandOption: true },
    'billing-date': { type: 'string', demandOption: true },
    total: { type: 'number', demandOption: true },
    'days-of-occupancy': { 
      type: 'number', 
    },
    'debug': { type: 'boolean', default: false },
    'adults': { 
      type: 'number', 
      demandOption: true, 
      describe: 'Number of adults in the household'
    }
  })
  .argv as any; // Add this line

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const billingStart = argv['billing-start'] as string;
const billingDate = argv['billing-date'] as string;
let daysOfOccupancy: number | undefined = undefined
const total = argv.total as number;
const adults = argv.adults as number;


const date1 = new Date(billingDate)
const date2 = new Date(billingStart)
// create a new variable numberOfDays which contains number of 
// days between billingStart and billingDate
const msInADay = 1000 * 60 * 60 * 24
const differenceMs: number = date1.getTime() - date2.getTime() + msInADay;
const numberOfDaysInTotal: number = differenceMs / (1000 * 60 * 60 * 24);
const numberOfUnits: number = 2
// create a new variable avgPerDay which contains the average amount
// per day or unit
const ratio = (2/3) * adults
const avgPerDay = (total / numberOfDaysInTotal / numberOfUnits) * (ratio);
if( argv['days-of-occupancy'] === undefined ) {
  daysOfOccupancy = numberOfDaysInTotal;
} else {
  daysOfOccupancy = argv['days-of-occupancy'] as number;
}
const amountDue = ( avgPerDay * daysOfOccupancy ).toFixed(2);

console.log('Billing Start:', billingStart);
console.log('Billing Date:', billingDate);
console.log('Total:', total);
console.log('Number of Days:', numberOfDaysInTotal);
console.log('Ratio:', ratio);
console.log('Avg per day:', avgPerDay);
console.log('Amount Due:', amountDue);

const previewHtml = generateEmailBody(
  billingStart,
  billingDate,
  total,
  avgPerDay,
  daysOfOccupancy,
  amountDue
);

fs.writeFileSync('preview.html', previewHtml);

const { exec } = require('child_process');
exec('open preview.html'); // For macOS/Linux

const mailOptions: nodemailer.SendMailOptions = {
  from: process.env.GMAIL_USERNAME,
  to: argv.to as string, // Typecast to string
  subject: 'Water and Sewer Usage Billing Information',
  html: previewHtml
};

console.log('Opening perview.html...');

if (argv.debug) {
    console.log('Debugging mode enabled. Email not sent. Exiting...');
    process.exit(0);
}

// Ask for confirmation before sending the email
const prompt = require('prompt-sync')();
const answer = prompt('Do you want to send this email? (yes/no): ');

if (answer.toLowerCase() === 'yes') {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error:', error);
    }
    console.log('Email sent:', info.response);
  });
} else {
  console.log('Email not sent. Exiting...');
}
