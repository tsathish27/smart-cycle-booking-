const express = require('express');
const { body, validationResult } = require('express-validator');
const Cycle = require('../models/Cycle');
const Station = require('../models/Station');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all cycles
// @route   GET /api/cycles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, stationId } = req.query;
    const filter = { isActive: true };

    if (status) filter.status = status;
    if (stationId) filter.stationId = stationId;

    const cycles = await Cycle.find(filter)
      .populate('stationId', 'name location');

    res.json({
      success: true,
      count: cycles.length,
      data: cycles
    });
  } catch (error) {
    console.error('Get cycles error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching cycles' 
    });
  }
});

// @desc    Get single cycle
// @route   GET /api/cycles/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const cycle = await Cycle.findById(req.params.id)
      .populate('stationId', 'name location');

    if (!cycle) {
      return res.status(404).json({ 
        success: false,
        message: 'Cycle not found' 
      });
    }

    res.json({
      success: true,
      data: cycle
    });
  } catch (error) {
    console.error('Get cycle error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching cycle' 
    });
  }
});

// @desc    Create new cycle
// @route   POST /api/cycles
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('cycleId').trim().notEmpty().withMessage('Cycle ID is required'),
  body('stationId').notEmpty().withMessage('Station ID is required'),
  body('model').trim().notEmpty().withMessage('Cycle model is required'),
  body('color').optional().trim(),
  body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor']).withMessage('Invalid condition value')
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

    // Check if cycle ID already exists
    const existingCycle = await Cycle.findOne({ cycleId: req.body.cycleId });
    if (existingCycle) {
      return res.status(400).json({ 
        success: false,
        message: 'Cycle with this ID already exists' 
      });
    }

    // Check if station exists
    const station = await Station.findById(req.body.stationId);
    if (!station) {
      return res.status(400).json({ 
        success: false,
        message: 'Station not found' 
      });
    }

    const cycle = await Cycle.create(req.body);

    res.status(201).json({
      success: true,
      data: cycle
    });
  } catch (error) {
    console.error('Create cycle error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating cycle' 
    });
  }
});

// @desc    Update cycle
// @route   PUT /api/cycles/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), [
  body('model').optional().trim().notEmpty().withMessage('Cycle model cannot be empty'),
  body('color').optional().trim(),
  body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor']).withMessage('Invalid condition value'),
  body('status').optional().isIn(['available', 'in-use', 'maintenance', 'out-of-service']).withMessage('Invalid status value')
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

    const cycle = await Cycle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!cycle) {
      return res.status(404).json({ 
        success: false,
        message: 'Cycle not found' 
      });
    }

    res.json({
      success: true,
      data: cycle
    });
  } catch (error) {
    console.error('Update cycle error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating cycle' 
    });
  }
});

// @desc    Delete cycle
// @route   DELETE /api/cycles/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const cycle = await Cycle.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!cycle) {
      return res.status(404).json({ 
        success: false,
        message: 'Cycle not found' 
      });
    }

    res.json({
      success: true,
      message: 'Cycle deactivated successfully'
    });
  } catch (error) {
    console.error('Delete cycle error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting cycle' 
    });
  }
});

// @desc    Get cycle by QR code
// @route   GET /api/cycles/qr/:cycleId
// @access  Public
router.get('/qr/:cycleId', async (req, res) => {
  try {
    const cycle = await Cycle.findOne({ 
      cycleId: req.params.cycleId,
      isActive: true 
    }).populate('stationId', 'name location');

    if (!cycle) {
      return res.status(404).json({ 
        success: false,
        message: 'Cycle not found' 
      });
    }

    res.json({
      success: true,
      data: cycle
    });
  } catch (error) {
    console.error('Get cycle by QR error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching cycle' 
    });
  }
});

// @desc    Update cycle status
// @route   PATCH /api/cycles/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, authorize('admin'), [
  body('status').isIn(['available', 'in-use', 'maintenance', 'out-of-service']).withMessage('Invalid status value')
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

    const cycle = await Cycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ 
        success: false,
        message: 'Cycle not found' 
      });
    }

    cycle.status = req.body.status;
    await cycle.save();

    res.json({
      success: true,
      data: cycle
    });
  } catch (error) {
    console.error('Update cycle status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating cycle status' 
    });
  }
});

// @desc    Get available cycles at station
// @route   GET /api/cycles/station/:stationId/available
// @access  Public
router.get('/station/:stationId/available', async (req, res) => {
  try {
    const cycles = await Cycle.findAvailableAtStation(req.params.stationId);

    res.json({
      success: true,
      count: cycles.length,
      data: cycles
    });
  } catch (error) {
    console.error('Get available cycles error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching available cycles' 
    });
  }
});

module.exports = router; 