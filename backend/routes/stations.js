const express = require('express');
const { body, validationResult } = require('express-validator');
const Station = require('../models/Station');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all stations
// @route   GET /api/stations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const stations = await Station.find({ isActive: true });

    res.json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching stations' 
    });
  }
});

// @desc    Get single station
// @route   GET /api/stations/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);

    if (!station) {
      return res.status(404).json({ 
        success: false,
        message: 'Station not found' 
      });
    }

    res.json({
      success: true,
      data: station
    });
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching station' 
    });
  }
});

// @desc    Create new station
// @route   POST /api/stations
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Station name must be at least 2 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('description').optional().trim(),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('coordinates.latitude').isFloat().withMessage('Valid latitude is required'),
  body('coordinates.longitude').isFloat().withMessage('Valid longitude is required')
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

    const station = await Station.create(req.body);

    res.status(201).json({
      success: true,
      data: station
    });
  } catch (error) {
    console.error('Create station error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating station' 
    });
  }
});

// @desc    Update station
// @route   PUT /api/stations/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Station name must be at least 2 characters'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('description').optional().trim(),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('coordinates.latitude').optional().isFloat().withMessage('Valid latitude is required'),
  body('coordinates.longitude').optional().isFloat().withMessage('Valid longitude is required')
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

    const station = await Station.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!station) {
      return res.status(404).json({ 
        success: false,
        message: 'Station not found' 
      });
    }

    res.json({
      success: true,
      data: station
    });
  } catch (error) {
    console.error('Update station error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating station' 
    });
  }
});

// @desc    Delete station
// @route   DELETE /api/stations/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!station) {
      return res.status(404).json({ 
        success: false,
        message: 'Station not found' 
      });
    }

    res.json({
      success: true,
      message: 'Station deactivated successfully'
    });
  } catch (error) {
    console.error('Delete station error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting station' 
    });
  }
});

// Get station statistics
router.get('/stats', async (req, res) => {
  try {
    const Cycle = require('../models/Cycle');
    const totalStations = await Station.countDocuments();
    const totalCycles = await Cycle.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalStations,
        totalCycles
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching station statistics',
      error: error.message
    });
  }
});

// @desc    Get station statistics
// @route   GET /api/stations/:id/stats
// @access  Private/Admin
router.get('/:id/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const Cycle = require('../models/Cycle');
    const Ride = require('../models/Ride');

    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ 
        success: false,
        message: 'Station not found' 
      });
    }

    // Get cycle counts
    const totalCycles = await Cycle.countDocuments({ stationId: req.params.id, isActive: true });
    const availableCycles = await Cycle.countDocuments({ 
      stationId: req.params.id, 
      status: 'available', 
      isActive: true 
    });

    // Get ride statistics for this station
    const rideStats = await Ride.aggregate([
      {
        $match: {
          startStation: require('mongoose').Types.ObjectId(req.params.id),
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRides: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    const stats = {
      station: station,
      cycles: {
        total: totalCycles,
        available: availableCycles,
        inUse: totalCycles - availableCycles
      },
      rides: rideStats[0] || {
        totalRides: 0,
        totalDuration: 0,
        avgDuration: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get station stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching station statistics' 
    });
  }
});

module.exports = router; 