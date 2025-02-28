require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Enable CORS (Adjust for production)
app.use(cors({
  origin: "*", // Change "*" to your frontend domain in production
  methods: "POST",
  allowedHeaders: ["Content-Type"]
}));

// ✅ Middleware
app.use(bodyParser.json());

// ✅ Nodemailer Transporter (Email Configuration)
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use SMTP, Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail (or SMTP) email
    pass: process.env.EMAIL_PASS, // Your App Password (if using Gmail)
  },
});

// ✅ API Route for Sending Emails
app.post("/send-email", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // 📩 Email to Owner
    const ownerMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Admin email
      subject: "New Work request",
      text: `You received a new message:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    // 📩 Confirmation Email to User
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // Sends email to the user
      subject: "Your Request Received 🙏",
      html: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for reaching out! We have received your message and will get back to you soon.Kindly call +254114522514</p>
        <p><strong>Your Message:</strong></p>
        <blockquote>${message}</blockquote>
        <p>Best regards,<br>Top home designer</p>
      `,
    };

    // ✅ Send Owner Email
    await transporter.sendMail(ownerMailOptions);
    console.log("✅ Owner email sent successfully");

    // ✅ Send User Confirmation Email
    await transporter.sendMail(userMailOptions);
    console.log("✅ User confirmation email sent successfully");

    return res.json({ success: true, message: "Emails sent successfully" });

  } catch (error) {
    console.error("❌ Error sending email:", error);
    return res.status(500).json({ success: false, message: "Email sending failed", error: error.message });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
