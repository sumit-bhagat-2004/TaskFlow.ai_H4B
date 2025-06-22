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

export const sendTaskNotificationEmail = async (email, taskName) => {
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
    subject: "New Task Assigned",
    text: `You have been assigned a new task: ${taskName}.\n\nPlease check your dashboard for more details.\n\nBest regards,\nThe Team`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Task notification email sent successfully");
  } catch (error) {
    console.error("Error sending task notification email:", error);
  }
};

export const sendTaskCompletionEmail = async (from, email, taskName) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from,
    to: email,
    subject: "Task Completed",
    text: `The task "${taskName}" has been marked as completed.\n\nThank you for your hard work!\n\nBest regards,\nThe Team`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Task completion email sent successfully");
  } catch (error) {
    console.error("Error sending task completion email:", error);
  }
};

export const sendMeetingInvitationEmail = async (email, meetingDetails) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const { subject, date, time, location, agenda } = meetingDetails;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject || "Meeting Invitation",
    text: `You are invited to a meeting.\n
Date: ${date}
Time: ${time}
Location: ${location}
Agenda: ${agenda || "N/A"}

Please confirm your attendance.

Best regards,
The Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Meeting invitation email sent successfully");
  } catch (error) {
    console.error("Error sending meeting invitation email:", error);
  }
};


