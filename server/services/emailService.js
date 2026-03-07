import nodemailer from 'nodemailer';

const transporterConfig = {
    pool: true,
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    maxConnections: 5,
    // Increase timeout for production stability
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
};

// Log configuration (masking password)
console.log("Email Service Configuration:", {
    host: transporterConfig.host,
    port: transporterConfig.port,
    secure: transporterConfig.secure,
    user: transporterConfig.auth.user ? "***" : "MISSING",
});

const transporter = nodemailer.createTransport(transporterConfig);

// Verify connection configuration on startup
// Verify connection configuration on startup
// transporter.verify(function (error, success) {
//     if (error) {
//         console.error("Email Service Verification Error:", error);
//     } else {
//         console.log("Email Service: Ready to send emails");
//     }
// });

export const sendEmail = async ({ to, subject, html }) => {
    try {
        console.log(`Attempting to send email to: ${to}`);

        // Use a verified domain if available, otherwise fallback to nice format or let Resend handle it if onboarding
        // Note: For Resend, if you don't have a domain, you MUST send from "onboarding@resend.dev" to yourself.
        // In production with a domain, use "noreply@yourdomain.com".
        const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

        const mailOptions = {
            from: `"Mockeefy Support" <${fromAddress}>`,
            to,
            subject,
            html
        };

        // Asynchronous sending with pooled connections
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully. MessageID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode,
        });
        return false;
    }
};

export const notifyReviewReceived = async (expertName, candidateEmail, sessionTopic, reviewData) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Session Feedback Received</h2>
            <p>Hello,</p>
            <p>Your mock interview session on <strong>${sessionTopic}</strong> has been reviewed by <strong>${expertName}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Overall Rating:</strong> ${reviewData.overallRating} / 5</p>
                <p><strong>Technical:</strong> ${reviewData.technicalRating} / 5</p>
                <p><strong>Communication:</strong> ${reviewData.communicationRating} / 5</p>
                <hr style="border: 0; border-top: 1px solid #d1d5db; margin: 10px 0;">
                <p><strong>Feedback:</strong></p>
                <p style="white-space: pre-wrap;">${reviewData.feedback}</p>
            </div>

            <p>Log in to your dashboard to view the full detailed report.</p>
            <br>
            <p>Best regards,<br>Mockeefy Team</p>
        </div>
    `;

    return sendEmail({
        to: candidateEmail,
        subject: `New Feedback from ${expertName} - Mockeefy`,
        html
    });
};
