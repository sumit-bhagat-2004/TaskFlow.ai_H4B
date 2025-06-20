import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Our Service",
    text: `Hello ${name},\n\nThank you for signing up for our service! We are excited to have you on board.\n\nBest regards,\nThe Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};
