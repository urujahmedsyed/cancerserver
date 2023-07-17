const nodemailer = require("nodemailer");

async function sendTestEmail() {
  // Create a transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "breastcancerotpservice@gmail.com",
      pass: "gkeysjskrawyexgf",
    },
  });

  // Define the email options
  let mailOptions = {
    from: "breastcancerotpservice@gmail.com",
    to: "urujahmedsyed@gmail.com",
    subject: "Test Email",
    text: "This is a test email sent from Nodemailer.",
  };

  try {
    // Send the email
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Call the function to send the test email
sendTestEmail();
