const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Station = require('./models/Station');
const Cycle = require('./models/Cycle');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartcycle', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@smartcycle.com',
    password: 'admin123',
    role: 'admin',
    phone: '1234567890'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'user',
    phone: '9876543210'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user',
    phone: '5555555555'
  }
];

const stations = [
  {
    name: 'Main Campus Station',
    location: 'Near Main Library',
    description: 'Primary station for campus access',
    capacity: 15,
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  },
  {
    name: 'Engineering Building Station',
    location: 'Engineering Complex',
    description: 'Station near engineering departments',
    capacity: 10,
    coordinates: {
      latitude: 40.7138,
      longitude: -74.0070
    }
  },
  {
    name: 'Student Center Station',
    location: 'Student Union Building',
    description: 'Central hub for student activities',
    capacity: 12,
    coordinates: {
      latitude: 40.7118,
      longitude: -74.0050
    }
  }
];

const cycles = [
  {
    cycleId: 'CYCLE001',
    model: 'Mountain Bike',
    color: 'Blue',
    condition: 'excellent'
  },
  {
    cycleId: 'CYCLE002',
    model: 'City Bike',
    color: 'Red',
    condition: 'good'
  },
  {
    cycleId: 'CYCLE003',
    model: 'Hybrid Bike',
    color: 'Green',
    condition: 'good'
  },
  {
    cycleId: 'CYCLE004',
    model: 'Mountain Bike',
    color: 'Black',
    condition: 'fair'
  },
  {
    cycleId: 'CYCLE005',
    model: 'City Bike',
    color: 'White',
    condition: 'excellent'
  },
  {
    cycleId: 'CYCLE006',
    model: 'Hybrid Bike',
    color: 'Yellow',
    condition: 'good'
  },
  {
    cycleId: 'CYCLE007',
    model: 'Mountain Bike',
    color: 'Orange',
    condition: 'good'
  },
  {
    cycleId: 'CYCLE008',
    model: 'City Bike',
    color: 'Purple',
    condition: 'excellent'
  }
];

// Import data function
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Station.deleteMany();
    await Cycle.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create stations
    const createdStations = await Station.create(stations);
    console.log(`🏢 Created ${createdStations.length} stations`);

    // Create cycles and assign to stations
    const cyclePromises = cycles.map((cycle, index) => {
      const stationIndex = Math.floor(index / 3); // Distribute cycles across stations
      const stationId = createdStations[stationIndex]._id;
      
      return Cycle.create({
        ...cycle,
        stationId: stationId
      });
    });

    const createdCycles = await Promise.all(cyclePromises);
    console.log(`🚲 Created ${createdCycles.length} cycles`);

    console.log('✅ Data imported successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin@smartcycle.com / admin123');
    console.log('User: john@example.com / user123');
    console.log('User: jane@example.com / user123');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

// Destroy data function
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Station.deleteMany();
    await Cycle.deleteMany();

    console.log('🗑️  Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error destroying data:', error);
    process.exit(1);
  }
};

// Handle command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 