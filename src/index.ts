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
    'avg-per-day': { type: 'number', demandOption: true },
    'days-of-occupancy': { type: 'number', demandOption: true },
    'amount-due': { type: 'number', demandOption: true },
  })
  .argv as any; // Add this line

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const previewHtml = generateEmailBody(
  argv['billing-start'] as string,
  argv['billing-date'] as string,
  argv.total as number,
  argv['avg-per-day'] as number,
  argv['days-of-occupancy'] as number,
  argv['amount-due'] as number
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
