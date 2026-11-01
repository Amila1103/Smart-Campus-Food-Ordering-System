import nodemailer from "nodemailer";

const sendStaffCredentialsEmail = async ({
  to,
  fullName,
  staffEmail,
  password,
}) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env file");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Delivery Staff Account Credentials",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello ${fullName},</h2>
        <p>Your delivery staff account has been created successfully.</p>
        <p><strong>Login Email:</strong> ${staffEmail}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in and change your password after your first login.</p>
        <br />
        <p>Best regards,</p>
        <p>Delivery Management Team</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export default sendStaffCredentialsEmail;