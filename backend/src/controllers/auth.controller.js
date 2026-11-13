import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { generateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  sendEmail,
  welcomeMailgenContent,
  forgotPasswordMailgenContent,
  emailVerificationMailgenContent
} from '../utils/Email.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, addresses } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required.');
  }

  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long.');
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    throw new ApiError(400, 'An account with this email already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate 32-byte email verification token (SHA-256 stored)
  const verifyRawToken = crypto.randomBytes(32).toString('hex');
  const verifyTokenHash = crypto.createHash('sha256').update(verifyRawToken).digest('hex');
  const verifyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    name,
    email: cleanEmail,
    password: hashedPassword,
    phone: phone || '',
    role: 'customer',
    addresses: addresses || [],
    emailVerified: false,
    emailVerificationTokenHash: verifyTokenHash,
    emailVerificationExpiresAt: verifyExpiresAt
  });

  const token = generateToken(user);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email/${verifyRawToken}`;

  // Send verification email
  sendEmail({
    email: user.email,
    subject: 'Verify Your BuildMart Account',
    mailgenContent: emailVerificationMailgenContent(user.name, verificationUrl)
  }).catch(err => {
    console.warn('Verification email delivery skipped:', err.message);
  });

  return res.status(201).json(
    new ApiResponse(201, {
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified
      }
    }, 'Account created successfully! Please check your email for the verification link.')
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.isActive === false) {
    throw new ApiError(401, 'Account has been deactivated. Please contact support.');
  }

  const token = generateToken(user);

  return res.status(200).json(
    new ApiResponse(200, {
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified
      }
    }, 'Login successful!')
  );
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail });

  if (!user || !['admin', 'manager', 'support'].includes(user.role)) {
    throw new ApiError(401, 'Invalid admin credentials.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid admin credentials.');
  }

  if (user.isActive === false) {
    throw new ApiError(401, 'Admin account has been deactivated.');
  }

  const token = generateToken(user);
  return res.status(200).json(
    new ApiResponse(200, {
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'Admin authorization successful!')
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').lean();
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, user, 'Profile retrieved successfully')
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, addresses, avatar } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (addresses) updateData.addresses = addresses;
  if (avatar) updateData.avatar = avatar;

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password').lean();

  if (!updated) {
    throw new ApiError(404, 'User not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, { user: updated }, 'Profile updated successfully')
  );
});

/**
 * POST /api/auth/forgot-password
 * Generates single-use 32-byte reset token (hashed with SHA-256).
 * Never reveals whether an email exists in the system (anti-enumeration).
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Email address is required.');
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail, isActive: true });

  if (user) {
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = expiresAt;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${rawResetToken}`;

    sendEmail({
      email: user.email,
      subject: 'BuildMart Password Reset Request',
      mailgenContent: forgotPasswordMailgenContent(user.name, resetUrl)
    }).catch(err => console.warn('Password reset email dispatch skipped:', err.message));
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      'If an active account with that email address exists, a password reset link has been dispatched.'
    )
  );
});

/**
 * POST /api/auth/reset-password
 * Resets user password using SHA-256 hashed token.
 * Invalidates all refresh tokens on password change.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw new ApiError(400, 'Reset token and new password are required.');
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters long.');
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() }
  });

  if (!user) {
    throw new ApiError(400, 'Password reset token is invalid or has expired.');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await user.save();

  // Invalidate all active refresh tokens for this user
  await RefreshToken.deleteMany({ user: user._id });

  return res.status(200).json(
    new ApiResponse(200, null, 'Password reset successfully. You may now log in with your new password.')
  );
});

/**
 * POST /api/auth/verify-email
 * Verifies email address using SHA-256 token (Idempotent for safe retries/scanners).
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw new ApiError(400, 'Verification token is required.');
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

  // 1. Check for active pending verification token
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() }
  });

  if (user) {
    user.emailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    user.lastVerifiedTokenHash = tokenHash;
    user.lastVerifiedAt = new Date();
    await user.save();

    return res.status(200).json(
      new ApiResponse(200, { emailVerified: true }, 'Email verified successfully! Your account is now fully active.')
    );
  }

  // 2. Idempotency: Check if this token was ALREADY verified recently
  const recentVerifiedUser = await User.findOne({
    lastVerifiedTokenHash: tokenHash,
    emailVerified: true
  });

  if (recentVerifiedUser) {
    return res.status(200).json(
      new ApiResponse(200, { emailVerified: true, alreadyVerified: true }, 'Email has been verified successfully. Your account is active.')
    );
  }

  throw new ApiError(400, 'Verification token is invalid or has expired.');
});

/**
 * POST /api/auth/resend-verification
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Email is required.');
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail, isActive: true });

  if (user && !user.emailVerified) {
    const verifyRawToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenHash = crypto.createHash('sha256').update(verifyRawToken).digest('hex');
    user.emailVerificationTokenHash = verifyTokenHash;
    user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${clientUrl}/verify-email/${verifyRawToken}`;

    sendEmail({
      email: user.email,
      subject: 'Verify Your BuildMart Account',
      mailgenContent: emailVerificationMailgenContent(user.name, verificationUrl)
    }).catch(err => console.warn('Resend verification email skipped:', err.message));
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'If this account is unverified, a new verification link has been sent.')
  );
});

/**
 * POST /api/auth/change-password
 * Authenticated password update.
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required.');
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters long.');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, 'Incorrect current password.');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Invalidate all active refresh tokens for this user
  await RefreshToken.deleteMany({ user: user._id });

  return res.status(200).json(
    new ApiResponse(200, null, 'Password updated successfully.')
  );
});

export default {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword
};
