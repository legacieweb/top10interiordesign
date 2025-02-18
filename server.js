require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Nodemailer Transporter (Owner's Email Setup)
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use "Outlook", "Yahoo", or SMTP
  auth: {
    user: process.env.EMAIL_USER, // Your email (e.g., Gmail)
    pass: process.env.EMAIL_PASS, // Your app password (not your regular password)
  },
});

// API Route for Contact Form Submission
app.post("/send-email", (req, res) => {
  const { name, email, message } = req.body;

  // Email to Owner
  const ownerMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Your email to receive messages
    subject: "New Contact Form Submission",
    text: `You received a new message:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Confirmation Email to User
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email, // Sends email to the user who submitted the form
    subject: "Your Contact Request Received",
    html: `<p>Hi <strong>${name}</strong>,</p>
           <p>Thank you for reaching out! We have received your message and will get back to you soon.</p>
           <p><strong>Your Message:</strong></p>
           <blockquote>${message}</blockquote>
           <p>Best regards,<br>Interior Design Team</p>`,
  };

  // Send both emails (Owner & User)
  transporter.sendMail(ownerMailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: "Error sending owner email" });
    } else {
      console.log("Owner email sent: " + info.response);

      transporter.sendMail(userMailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ success: false, message: "Error sending confirmation email" });
        } else {
          console.log("User confirmation email sent: " + info.response);
          return res.json({ success: true, message: "Emails sent successfully" });
        }
      });
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
