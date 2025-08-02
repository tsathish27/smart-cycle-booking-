const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  cycleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cycle',
    required: [true, 'Cycle ID is required']
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: [true, 'Station ID is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  startStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: [true, 'Start station is required']
  },
  endStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    default: null
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    }
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

// Calculate duration when ride ends
rideSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    const durationMs = this.endTime.getTime() - this.startTime.getTime();
    this.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Virtual for formatted duration
rideSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return 'Ongoing';
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Virtual for total cost (example: $1 per hour)
rideSchema.virtual('cost').get(function() {
  if (!this.duration) return 0;
  const hours = this.duration / 60;
  return Math.ceil(hours) * 1; // $1 per hour, rounded up
});

// Static method to find active rides for a user
rideSchema.statics.findActiveRide = function(userId) {
  return this.findOne({
    userId,
    status: 'active',
    endTime: null
  }).populate(['cycleId', 'startStation', 'endStation']);
};

// Static method to get ride statistics
rideSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRides: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCost: { $sum: { $multiply: [{ $ceil: { $divide: ['$duration', 60] } }, 1] } }
      }
    }
  ]);
};

// Ensure virtuals are included in JSON output
rideSchema.set('toJSON', { virtuals: true });
rideSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Ride', rideSchema); 