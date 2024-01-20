"use strict";
// src/index.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
function sendEmail(subject, body, toEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a transporter with your email credentials
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your_email@gmail.com', // Replace with your Gmail email address
                pass: 'your_password', // Replace with your Gmail app password
            },
        });
        // Email options
        const mailOptions = {
            from: 'your_email@gmail.com', // Replace with your Gmail email address
            to: toEmail,
            subject: subject,
            text: body,
        };
        // Send the email
        const info = yield transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.messageId);
    });
}
// Email content
const subject = 'Water and Sewer Usage Report';
const body = `
Below is information about water and sewer usage for the latest billing period.

Billing Start    Billing Date    Total ($)
11/16/2023    12/19/2023    $128.85

Avg per day/unit ($)    Days of Occupancy    Amount Due ($)
$1.89    34    $64.43

You have the option of paying as soon as you get the bill or to add the amount to the next rent payment.

Thank you
`;
// Recipient's email address
const toEmail = 'recipient@example.com'; // Replace with the recipient's email address
// Send the email
sendEmail(subject, body, toEmail);
