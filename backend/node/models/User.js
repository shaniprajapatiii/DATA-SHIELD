const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'enterprise'],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    avatar: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: {
      type: Date,
      default: null,
    },
    preferences: {
      notifications: { type: Boolean, default: true },
      riskAlertThreshold: { type: Number, default: 70 }, // alert when score > 70
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      autoScan: { type: Boolean, default: false },
    },
    // API usage tracking
    apiUsage: {
      scansThisMonth: { type: Number, default: 0 },
      totalScans: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now },
    },
    // Linked extension ID
    extensionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('scanHistory', {
  ref: 'Scan',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.canScan = function () {
  const limits = { free: 10, pro: 200, enterprise: Infinity };
  const reset = new Date(this.apiUsage.lastReset);
  const now   = new Date();
  // Reset monthly counter
  if (now.getMonth() !== reset.getMonth()) {
    this.apiUsage.scansThisMonth = 0;
    this.apiUsage.lastReset = now;
  }
  return this.apiUsage.scansThisMonth < limits[this.plan];
};

userSchema.methods.incrementScanCount = async function () {
  this.apiUsage.scansThisMonth += 1;
  this.apiUsage.totalScans += 1;
  return this.save({ validateBeforeSave: false });
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// ─── Pre-save Hook (Hash password if modified) ─────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── toJSON - Remove sensitive fields ──────────────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.verificationToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
