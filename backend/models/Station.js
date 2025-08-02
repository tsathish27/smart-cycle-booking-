const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Station name is required'],
    trim: true,
    maxlength: [100, 'Station name cannot be more than 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Station location is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  capacity: {
    type: Number,
    default: 10,
    min: [1, 'Capacity must be at least 1']
  },
  coordinates: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    }
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

// Virtual for available cycles count
stationSchema.virtual('availableCycles', {
  ref: 'Cycle',
  localField: '_id',
  foreignField: 'stationId',
  match: { status: 'available' },
  count: true
});

// Virtual for total cycles count
stationSchema.virtual('totalCycles', {
  ref: 'Cycle',
  localField: '_id',
  foreignField: 'stationId',
  count: true
});

// Ensure virtuals are included in JSON output
stationSchema.set('toJSON', { virtuals: true });
stationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Station', stationSchema); 