import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const smtpHost = process.env.MAILTRAP_SMTP_HOST || process.env.NODEMAILER_SMTP_HOST;
  const smtpPort = process.env.MAILTRAP_SMTP_PORT || process.env.NODEMAILER_SMTP_PORT || 587;
  const smtpUser = process.env.MAILTRAP_SMTP_USER || process.env.NODEMAILER_SMTP_USER;
  const smtpPass = process.env.MAILTRAP_SMTP_PASS || process.env.NODEMAILER_SMTP_PASS;

  if (!smtpHost || !smtpUser) {
    console.warn(`⚠️ Email not sent to ${options.email}: SMTP credentials not configured in .env.`);
    return null;
  }

  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'BuildMart',
      link: process.env.CLIENT_URL || 'http://localhost:5173'
    }
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const mail = {
    from: process.env.SMTP_FROM || 'support@buildmart.com',
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml
  };

  try {
    const info = await transporter.sendMail(mail);
    return info;
  } catch (error) {
    console.error('Email service failed silently:', error.message);
    return null;
  }
};

const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username || 'Valued Customer',
      intro: 'Welcome to BuildMart! We are excited to have you on board.',
      action: {
        instructions: 'To verify your email address, please click the button below:',
        button: {
          color: '#e05a00',
          text: 'Verify Email',
          link: verificationUrl
        }
      },
      outro: 'Need assistance with your construction orders? Just reply to this email, we are here to help.'
    }
  };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username || 'User',
      intro: 'We received a request to reset the password for your BuildMart account.',
      action: {
        instructions: 'To reset your password, click the button below:',
        button: {
          color: '#e05a00',
          text: 'Reset Password',
          link: passwordResetUrl
        }
      },
      outro: 'If you did not request a password reset, no further action is required.'
    }
  };
};

const welcomeMailgenContent = (username, webUrl) => {
  return {
    body: {
      name: username || 'Valued Partner',
      intro: 'Welcome to BuildMart - India\'s premier construction materials platform.',
      action: {
        instructions: 'Start exploring our materials catalog, bulk quotation tools, and contractor services:',
        button: {
          color: '#e05a00',
          text: 'Explore Catalog',
          link: webUrl || (process.env.CLIENT_URL || 'http://localhost:5173')
        }
      },
      outro: 'Need wholesale quotes or special contractor rates? Reach out to our procurement team anytime.'
    }
  };
};



export  {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  welcomeMailgenContent
};