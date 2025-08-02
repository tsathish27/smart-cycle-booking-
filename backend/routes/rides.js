const express = require('express');
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const Cycle = require('../models/Cycle');
const Station = require('../models/Station');
const { protect, checkActiveRide } = require('../middleware/auth');

const router = express.Router();

// @desc    Start a ride (scan QR code)
// @route   POST /api/rides/start
// @access  Private
router.post('/start', protect, checkActiveRide, [
  body('cycleId').notEmpty().withMessage('Cycle ID is required'),
  body('stationId').notEmpty().withMessage('Station ID is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Check if user already has an active ride
    if (req.activeRide) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have an active ride' 
      });
    }

    const { cycleId, stationId } = req.body;

    // Find cycle by cycleId (from QR code)
    const cycle = await Cycle.findOne({ 
      cycleId: cycleId,
      isActive: true 
    }).populate('stationId');

    if (!cycle) {
      return res.status(404).json({ 
        success: false,
        message: 'Cycle not found' 
      });
    }

    // Check if cycle is available
    if (cycle.status !== 'available') {
      return res.status(400).json({ 
        success: false,
        message: 'Cycle is not available for use' 
      });
    }

    // Verify station
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ 
        success: false,
        message: 'Station not found' 
      });
    }

    // Create new ride
    const ride = await Ride.create({
      userId: req.user._id,
      cycleId: cycle._id,
      stationId: stationId,
      startStation: stationId,
      startTime: new Date()
    });

    // Update cycle status to in-use
    await cycle.updateStatus('in-use');

    // Populate ride with cycle and station details
    await ride.populate([
      { path: 'cycleId', select: 'cycleId model color' },
      { path: 'startStation', select: 'name location' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Ride started successfully',
      data: ride
    });
  } catch (error) {
    console.error('Start ride error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while starting ride' 
    });
  }
});

// @desc    End a ride (scan QR code again)
// @route   POST /api/rides/end
// @access  Private
router.post('/end', protect, checkActiveRide, [
  body('cycleId').notEmpty().withMessage('Cycle ID is required'),
  body('stationId').notEmpty().withMessage('Station ID is required'),
  body('feedback.rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback.comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Check if user has an active ride
    if (!req.activeRide) {
      return res.status(400).json({ 
        success: false,
        message: 'No active ride found' 
      });
    }

    const { cycleId, stationId, feedback } = req.body;

    // Find cycle by cycleId (from QR code)
    const cycle = await Cycle.findOne({ 
      cycleId: cycleId,
      isActive: true 
    });

    if (!cycle) {
      return res.status(404).json({ 
        success: false,
        message: 'Cycle not found' 
      });
    }

    // Verify the cycle matches the active ride
    if (req.activeRide.cycleId._id.toString() !== cycle._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cycle does not match your active ride' 
      });
    }

    // Verify station
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ 
        success: false,
        message: 'Station not found' 
      });
    }

    // End the ride
    const ride = await Ride.findByIdAndUpdate(
      req.activeRide._id,
      {
        endTime: new Date(),
        endStation: stationId,
        status: 'completed',
        feedback: feedback || {}
      },
      { new: true }
    ).populate([
      { path: 'cycleId', select: 'cycleId model color' },
      { path: 'startStation', select: 'name location' },
      { path: 'endStation', select: 'name location' }
    ]);

    // Update cycle status to available
    await cycle.updateStatus('available');

    res.json({
      success: true,
      message: 'Ride ended successfully',
      data: ride
    });
  } catch (error) {
    console.error('End ride error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while ending ride' 
    });
  }
});

// @desc    Get user's ride history
// @route   GET /api/rides/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rides = await Ride.find({ 
      userId: req.user._id,
      status: 'completed'
    })
    .populate([
      { path: 'cycleId', select: 'cycleId model color' },
      { path: 'startStation', select: 'name location' },
      { path: 'endStation', select: 'name location' }
    ])
    .sort({ endTime: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Ride.countDocuments({ 
      userId: req.user._id,
      status: 'completed'
    });

    res.json({
      success: true,
      data: rides,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get ride history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching ride history' 
    });
  }
});

// @desc    Get current active ride
// @route   GET /api/rides/active
// @access  Private
router.get('/active', protect, checkActiveRide, async (req, res) => {
  try {
    if (!req.activeRide) {
      return res.json({
        success: true,
        data: null,
        message: 'No active ride'
      });
    }

    // Populate ride details
    await req.activeRide.populate([
      { path: 'cycleId', select: 'cycleId model color' },
      { path: 'startStation', select: 'name location' }
    ]);

    res.json({
      success: true,
      data: req.activeRide
    });
  } catch (error) {
    console.error('Get active ride error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching active ride' 
    });
  }
});

// @desc    Get user ride statistics
// @route   GET /api/rides/stats
// @access  Private/Admin
router.get('/stats', protect, async (req, res) => {
  try {
    const activeRides = await Ride.countDocuments({ endTime: null });
    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ endTime: { $exists: true } });
    
    res.json({
      success: true,
      data: {
        activeRides,
        totalRides,
        completedRides
      }
    });
  } catch (error) {
    console.error('Get rides stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching rides statistics' 
    });
  }
});

// @desc    Cancel active ride
// @route   POST /api/rides/cancel
// @access  Private
router.post('/cancel', protect, checkActiveRide, async (req, res) => {
  try {
    if (!req.activeRide) {
      return res.status(400).json({ 
        success: false,
        message: 'No active ride to cancel' 
      });
    }

    // Cancel the ride
    const ride = await Ride.findByIdAndUpdate(
      req.activeRide._id,
      {
        endTime: new Date(),
        status: 'cancelled'
      },
      { new: true }
    );

    // Update cycle status to available
    await Cycle.findByIdAndUpdate(
      req.activeRide.cycleId,
      { status: 'available' }
    );

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      data: ride
    });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while cancelling ride' 
    });
  }
});

module.exports = router;