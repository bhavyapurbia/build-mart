import mongoose from 'mongoose';
import { USER_ROLE } from '../constants/enums.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  role: { 
    type: String, 
    enum: Object.values(USER_ROLE), 
    default: USER_ROLE.CUSTOMER 
  },
  avatar: { type: String },
  addresses: [{
    street: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  emailVerificationTokenHash: { type: String, default: null },
  emailVerificationExpiresAt: { type: Date, default: null },
  lastVerifiedTokenHash: { type: String, default: null },
  lastVerifiedAt: { type: Date, default: null },
  passwordResetTokenHash: { type: String, default: null },
  passwordResetExpiresAt: { type: Date, default: null },
  internalNotes: { type: String, default: '' }
}, {
  timestamps: true,
  minimize: false,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationTokenHash;
      delete ret.passwordResetTokenHash;
      return ret;
    }
  }
});

userSchema.index({ role: 1 });
userSchema.index({ passwordResetTokenHash: 1 }, { sparse: true });
userSchema.index({ emailVerificationTokenHash: 1 }, { sparse: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
export { User };
