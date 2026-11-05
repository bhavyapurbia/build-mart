const { createUnifiedModel } = require('./dbAdapter');

const User = createUnifiedModel('User', {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  avatar: { type: String },
  addresses: [{
    street: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean
  }],
  isActive: { type: Boolean, default: true }
});

module.exports = User;

