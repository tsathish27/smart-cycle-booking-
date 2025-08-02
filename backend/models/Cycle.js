const mongoose = require('mongoose');
const QRCode = require('qrcode');

const cycleSchema = new mongoose.Schema({
  cycleId: {
    type: String,
    required: [true, 'Cycle ID is required'],
    unique: true,
    trim: true
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: [true, 'Station ID is required']
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'out-of-service'],
    default: 'available'
  },
  model: {
    type: String,
    required: [true, 'Cycle model is required'],
    trim: true
  },
  color: {
    type: String,
    trim: true,
    default: 'Black'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  qrCode: {
    type: String,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate QR code before saving
cycleSchema.pre('save', async function(next) {
  if (!this.isModified('cycleId') && this.qrCode) return next();
  
  try {
    // Generate QR code with cycle ID
    this.qrCode = await QRCode.toDataURL(this.cycleId, {
      width: parseInt(process.env.QR_CODE_SIZE) || 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to update status
cycleSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.updatedAt = new Date();
  return this.save();
};

// Static method to find available cycles at a station
cycleSchema.statics.findAvailableAtStation = function(stationId) {
  return this.find({
    stationId,
    status: 'available',
    isActive: true
  }).populate('stationId', 'name location');
};

// Virtual for current ride
cycleSchema.virtual('currentRide', {
  ref: 'Ride',
  localField: '_id',
  foreignField: 'cycleId',
  match: { endTime: null },
  justOne: true
});

// Ensure virtuals are included in JSON output
cycleSchema.set('toJSON', { virtuals: true });
cycleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cycle', cycleSchema); 