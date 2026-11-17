import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

let pooledTransporter = null;

export const getPrimaryClientUrl = () => {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173';
  const urls = raw.split(',').map(u => u.trim()).filter(Boolean);
  if (process.env.NODE_ENV === 'production') {
    const prodUrl = urls.find(u => !u.includes('localhost') && !u.includes('127.0.0.1'));
    if (prodUrl) return prodUrl.replace(/\/+$/, '');
  }
  return (urls[0] || 'http://localhost:5173').replace(/\/+$/, '');
};

export const getSenderFromAddress = () => {
  if (process.env.SMTP_FROM) return process.env.SMTP_FROM;

  let email = process.env.BREVO_FROM_EMAIL || 'support@buildplace.com';
  // If only domain was provided like 'buildplace.com', ensure valid email format
  if (email && !email.includes('@')) {
    email = `support@${email.replace(/["']/g, '').trim()}`;
  }
  const name = process.env.BREVO_FROM_NAME || 'BuildPlace';
  return `"${name}" <${email}>`;
};

const getTransporter = () => {
  if (pooledTransporter) return pooledTransporter;

  const smtpHost = process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST || process.env.MAILTRAP_SMTP_HOST || process.env.NODEMAILER_SMTP_HOST;
  const smtpPort = parseInt(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || process.env.MAILTRAP_SMTP_PORT || process.env.NODEMAILER_SMTP_PORT || '587', 10);
  const smtpUser = process.env.BREVO_SMTP_USER || process.env.SMTP_USER || process.env.MAILTRAP_SMTP_USER || process.env.NODEMAILER_SMTP_USER;
  const smtpPass = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS || process.env.MAILTRAP_SMTP_PASS || process.env.NODEMAILER_SMTP_PASS;

  if (!smtpHost || !smtpUser) {
    return null;
  }

  pooledTransporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 6,
    maxMessages: 100,
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  return pooledTransporter;
};

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: process.env.BREVO_FROM_NAME || 'BuildPlace',
    link: getPrimaryClientUrl()
  }
});

export const sendEmail = async (options) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`⚠️ Email not sent to ${options.email}: SMTP credentials not configured in environment.`);
    return null;
  }

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const mail = {
    from: getSenderFromAddress(),
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml
  };

  try {
    const info = await transporter.sendMail(mail);
    return info;
  } catch (error) {
    console.error('Email dispatch failed:', error.message);
    return null;
  }
};

export const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username || 'Valued Customer',
      intro: 'Welcome to BuildPlace! We are excited to have you on board.',
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

export const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username || 'User',
      intro: 'We received a request to reset the password for your BuildPlace account.',
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

export const welcomeMailgenContent = (username, webUrl) => {
  return {
    body: {
      name: username || 'Valued Partner',
      intro: 'Welcome to BuildPlace - India\'s premier construction materials platform.',
      action: {
        instructions: 'Start exploring our materials catalog, bulk quotation tools, and contractor services:',
        button: {
          color: '#e05a00',
          text: 'Explore Catalog',
          link: webUrl || getPrimaryClientUrl()
        }
      },
      outro: 'Need wholesale quotes or special contractor rates? Reach out to our procurement team anytime.'
    }
  };
};

export default {
  sendEmail,
  getPrimaryClientUrl,
  getSenderFromAddress,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  welcomeMailgenContent
};
