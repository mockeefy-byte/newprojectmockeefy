import { sendEmail } from "./services/emailService.js";

console.log("Starting Email Verification Script...");

async function verify() {
    console.log("Simulating email send...");
    const result = await sendEmail({
        to: "test@example.com",
        subject: "Test Email",
        html: "<p>This is a test.</p>"
    });
    console.log("Send result:", result);

    // We expect it to likely fail network connection to "smtp.test.com" but pass the config validation.
    // However, if we use real Gmail settings from .env (unavailable here), it might work.
    // For this test, I will just check if it throws synchronously or crashes.
}

// Wait for the transporter.verify to likely happen
setTimeout(verify, 2000);
