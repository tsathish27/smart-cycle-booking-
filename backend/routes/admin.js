const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Station = require('../models/Station');
const Cycle = require('../models/Cycle');
const Ride = require('../models/Ride');

// Apply admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// ==================== DASHBOARD STATISTICS ====================
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalStations = await Station.countDocuments();
    const totalCycles = await Cycle.countDocuments();
    const totalRides = await Ride.countDocuments();

    // Get active rides
    const activeRides = await Ride.countDocuments({ endTime: null });

    // Get today's rides
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRides = await Ride.countDocuments({
      startTime: { $gte: today }
    });

    // Get revenue (assuming ₹10 per hour)
    const completedRides = await Ride.find({ endTime: { $exists: true } });
    const totalRevenue = completedRides.reduce((sum, ride) => {
      const durationHours = ride.duration / 60; // Convert minutes to hours
      return sum + (durationHours * 10); // ₹10 per hour
    }, 0);

    // Get recent activity
    const recentRides = await Ride.find()
      .populate('user', 'name email')
      .populate('cycle', 'cycleId')
      .sort({ startTime: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStations,
          totalCycles,
          totalRides,
          activeRides,
          todayRides,
          totalRevenue: Math.round(totalRevenue * 100) / 100
        },
        recentActivity: {
          rides: recentRides,
          users: recentUsers
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// ==================== STATION MANAGEMENT ====================
// Get all stations
router.get('/stations', async (req, res) => {
  try {
    const stations = await Station.find();
    res.json({
      success: true,
      data: stations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stations',
      error: error.message
    });
  }
});

// Create new station
router.post('/stations', async (req, res) => {
  try {
    const { name, location, description, capacity, coordinates } = req.body;
    
    const station = new Station({
      name,
      location,
      description,
      capacity,
      coordinates
    });

    await station.save();
    res.status(201).json({
      success: true,
      data: station
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating station',
      error: error.message
    });
  }
});

// Update station
router.put('/stations/:id', async (req, res) => {
  try {
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
    res.status(400).json({
      success: false,
      message: 'Error updating station',
      error: error.message
    });
  }
});

// Delete station
router.delete('/stations/:id', async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.json({
      success: true,
      message: 'Station deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting station',
      error: error.message
    });
  }
});

// ==================== CYCLE MANAGEMENT ====================
// Get all cycles
router.get('/cycles', async (req, res) => {
  try {
    const cycles = await Cycle.find().populate('stationId', 'name location');
    res.json({
      success: true,
      data: cycles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cycles',
      error: error.message
    });
  }
});

// Create new cycle
router.post('/cycles', async (req, res) => {
  try {
    const { cycleId, model, color, condition, stationId } = req.body;
    
    const cycle = new Cycle({
      cycleId,
      model,
      color,
      condition,
      stationId: stationId
    });

    await cycle.save();
    res.status(201).json({
      success: true,
      data: cycle
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating cycle',
      error: error.message
    });
  }
});

// Update cycle
router.put('/cycles/:id', async (req, res) => {
  try {
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
    res.status(400).json({
      success: false,
      message: 'Error updating cycle',
      error: error.message
    });
  }
});

// Delete cycle
router.delete('/cycles/:id', async (req, res) => {
  try {
    const cycle = await Cycle.findByIdAndDelete(req.params.id);
    
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found'
      });
    }

    res.json({
      success: true,
      message: 'Cycle deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting cycle',
      error: error.message
    });
  }
});

// ==================== USER MANAGEMENT ====================
// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// Delete user (soft delete)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
});

// ==================== RIDE ANALYTICS ====================
// Get ride analytics
router.get('/analytics/rides', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const rides = await Ride.find({
      startTime: { $gte: startDate }
    }).populate('user', 'name email').populate('cycleId', 'cycleId');

    // Calculate analytics
    const totalRides = rides.length;
    const totalDuration = rides.reduce((sum, ride) => sum + (ride.duration || 0), 0);
    const totalRevenue = rides.reduce((sum, ride) => {
      const durationHours = (ride.duration || 0) / 60;
      return sum + (durationHours * 10);
    }, 0);

    // Group by date
    const ridesByDate = rides.reduce((acc, ride) => {
      const date = ride.startTime.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(ride);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalRides,
          totalDuration,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          averageDuration: totalRides > 0 ? Math.round(totalDuration / totalRides) : 0
        },
        ridesByDate,
        rides
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ride analytics',
      error: error.message
    });
  }
});

// ==================== REPORTS ====================
// Generate comprehensive report
router.get('/reports/comprehensive', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const rides = await Ride.find(query)
      .populate('user', 'name email')
      .populate('cycleId', 'cycleId')
      .populate('startStation', 'name');

    const users = await User.find();
    const stations = await Station.find();
    const cycles = await Cycle.find();

    // Calculate report data
    const totalRevenue = rides.reduce((sum, ride) => {
      const durationHours = (ride.duration || 0) / 60;
      return sum + (durationHours * 10);
    }, 0);

    const topUsers = rides.reduce((acc, ride) => {
      const userId = ride.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: ride.user,
          rides: 0,
          totalDuration: 0,
          totalSpent: 0
        };
      }
      acc[userId].rides++;
      acc[userId].totalDuration += ride.duration || 0;
      acc[userId].totalSpent += ((ride.duration || 0) / 60) * 10;
      return acc;
    }, {});

    const topStations = rides.reduce((acc, ride) => {
      const stationId = ride.startStation?._id?.toString();
      if (stationId && !acc[stationId]) {
        acc[stationId] = {
          station: ride.startStation,
          rides: 0
        };
      }
      if (stationId) {
        acc[stationId].rides++;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalRides: rides.length,
          totalUsers: users.length,
          totalStations: stations.length,
          totalCycles: cycles.length,
          totalRevenue: Math.round(totalRevenue * 100) / 100
        },
        topUsers: Object.values(topUsers).sort((a, b) => b.rides - a.rides).slice(0, 10),
        topStations: Object.values(topStations).sort((a, b) => b.rides - a.rides).slice(0, 10),
        rides
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
});

module.exports = router; 