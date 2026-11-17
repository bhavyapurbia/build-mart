import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

let pooledTransporter = null;

export const getPrimaryClientUrl = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.trim().replace(/\/+$/, '');
  }

  const raw = process.env.CLIENT_URL || 'http://localhost:5173';
  const urls = raw.split(',').map(u => u.trim()).filter(Boolean);
  const isProdLike =
    process.env.NODE_ENV === 'production' ||
    process.env.RENDER === 'true' ||
    Boolean(process.env.RENDER_EXTERNAL_URL);

  if (isProdLike) {
    const frontendProdUrl = urls.find(
      u => !u.includes('localhost') && !u.includes('127.0.0.1') && !u.includes('onrender.com')
    );
    if (frontendProdUrl) return frontendProdUrl.replace(/\/+$/, '');

    const anyProdUrl = urls.find(u => !u.includes('localhost') && !u.includes('127.0.0.1'));
    if (anyProdUrl) return anyProdUrl.replace(/\/+$/, '');
  }

  return (urls[0] || 'http://localhost:5173').replace(/\/+$/, '');
};

export const getSenderDetails = () => {
  const name = (process.env.BREVO_FROM_NAME || 'BuildPlace').replace(/["']/g, '').trim();
  let email = (process.env.BREVO_FROM_EMAIL || '').replace(/["']/g, '').trim();

  if (!email && process.env.SMTP_FROM) {
    const match = process.env.SMTP_FROM.match(/<([^>]+)>/);
    email = (match ? match[1] : process.env.SMTP_FROM).replace(/["']/g, '').trim();
  }

  if (!email) {
    email = 'support@buildplace.com';
  }

  // Ensure valid mailbox format if only a bare domain like 'buildplace.com' was provided
  if (!email.includes('@')) {
    email = `support@${email}`;
  }

  return {
    name,
    email,
    formatted: `"${name}" <${email}>`
  };
};

export const getSenderFromAddress = () => getSenderDetails().formatted;

const getTransporter = () => {
  if (pooledTransporter) return pooledTransporter;

  const smtpHost = process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST || process.env.MAILTRAP_SMTP_HOST || process.env.NODEMAILER_SMTP_HOST;
  const smtpPort = parseInt(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || process.env.MAILTRAP_SMTP_PORT || process.env.NODEMAILER_SMTP_PORT || '587', 10);
  const smtpUser = process.env.BREVO_SMTP_USER || process.env.SMTP_USER || process.env.MAILTRAP_SMTP_USER || process.env.NODEMAILER_SMTP_USER;
  const smtpPass = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS || process.env.MAILTRAP_SMTP_PASS || process.env.NODEMAILER_SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  pooledTransporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return pooledTransporter;
};

const getMailGenerator = () =>
  new Mailgen({
    theme: 'default',
    product: {
      name: (process.env.BREVO_FROM_NAME || 'BuildPlace').replace(/["']/g, '').trim(),
      link: getPrimaryClientUrl()
    }
  });

const sendViaBrevoHttpApi = async ({ email, subject, html, text, sender }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey.trim()
    },
    body: JSON.stringify({
      sender: { name: sender.name, email: sender.email },
      to: [{ email }],
      subject,
      htmlContent: html,
      textContent: text
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `Brevo HTTP API (${response.status}): ${payload.message || payload.code || response.statusText}`
    );
  }
  return payload;
};

export const sendEmail = async (options) => {
  const mailGenerator = getMailGenerator();
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);
  const sender = getSenderDetails();

  // Priority 1: Brevo HTTP Transactional API (HTTPS port 443 — never blocked by Render/cloud firewalls)
  if (process.env.BREVO_API_KEY) {
    try {
      const result = await sendViaBrevoHttpApi({
        email: options.email,
        subject: options.subject,
        html: emailHtml,
        text: emailTextual,
        sender
      });
      console.log(`✅ Email dispatched via Brevo API to ${options.email} (messageId: ${result?.messageId || 'ok'})`);
      return result;
    } catch (apiError) {
      console.error('❌ Brevo HTTP API dispatch failed:', apiError.message);
      // Fall through to SMTP if SMTP credentials are also configured
    }
  }

  // Priority 2: SMTP (Brevo SMTP / Standard SMTP)
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`⚠️ Email not sent to ${options.email}: Neither BREVO_API_KEY nor SMTP credentials configured.`);
    return null;
  }

  const mail = {
    from: sender.formatted,
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml
  };

  try {
    const info = await transporter.sendMail(mail);
    console.log(`✅ Email dispatched via SMTP to ${options.email} (messageId: ${info?.messageId || 'ok'})`);
    return info;
  } catch (error) {
    // Reset pooled transporter on error so stale connections are not reused
    pooledTransporter = null;
    console.error(`❌ SMTP Email dispatch failed to ${options.email}:`, error.message);

    if (error.message?.includes('525') || error.message?.toLowerCase().includes('unauthorized ip')) {
      console.error(
        '👉 Brevo Fix: Go to Brevo Dashboard -> Settings -> Security -> Authorized IPs and DEACTIVATE blocking unknown IP addresses.'
      );
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error(
        '👉 Cloud Host Fix: Outbound SMTP port may be blocked by your host (e.g. Render Free Tier). Set BREVO_API_KEY (from Brevo -> SMTP & API -> API Keys) to send over HTTPS.'
      );
    }

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
  getSenderDetails,
  getSenderFromAddress,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  welcomeMailgenContent
};
