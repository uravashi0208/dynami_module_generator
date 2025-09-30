const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  username: {
    type: String,
    unique: true,
    sparse: true, // This allows multiple null values but enforces uniqueness for non-null values
  },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  isActive: { type: Boolean, default: true }, // Add isActive field
  resetPasswordToken: { type: String, required: false },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }, // Add createdAt field
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.password === 'google-oauth') return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password validation method
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);