# SmartCycle Backend API

A robust Node.js/Express API for the SmartCycle digital cycle booking system.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access
- **Station Management**: CRUD operations for cycle stations
- **Cycle Management**: QR code generation and cycle status tracking
- **Ride Management**: Start/end rides with QR scanning
- **Ride History**: Complete ride tracking and statistics
- **Admin Dashboard**: User management and system analytics

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **QR Code**: qrcode library
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env file with your configuration
   ```

4. **Environment Variables**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/smartcycle
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   QR_CODE_SIZE=200
   ```

5. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Seed the database with sample data
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Database Seeding
```bash
# Import sample data
npm run seed

# Clear all data
npm run seed:destroy
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User Profile
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Station Endpoints

#### Get All Stations
```
GET /api/stations
```

#### Get Single Station
```
GET /api/stations/:id
```

#### Create Station (Admin Only)
```
POST /api/stations
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Station",
  "location": "Near Library",
  "description": "Station description",
  "capacity": 10,
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

### Cycle Endpoints

#### Get All Cycles
```
GET /api/cycles?status=available&stationId=station_id
```

#### Get Cycle by QR Code
```
GET /api/cycles/qr/CYCLE001
```

#### Create Cycle (Admin Only)
```
POST /api/cycles
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "cycleId": "CYCLE009",
  "stationId": "station_id",
  "model": "Mountain Bike",
  "color": "Blue",
  "condition": "excellent"
}
```

### Ride Endpoints

#### Start Ride (Scan QR)
```
POST /api/rides/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "cycleId": "CYCLE001",
  "stationId": "station_id"
}
```

#### End Ride (Scan QR Again)
```
POST /api/rides/end
Authorization: Bearer <token>
Content-Type: application/json

{
  "cycleId": "CYCLE001",
  "stationId": "station_id",
  "feedback": {
    "rating": 5,
    "comment": "Great ride!"
  }
}
```

#### Get Ride History
```
GET /api/rides/history?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Active Ride
```
GET /api/rides/active
Authorization: Bearer <token>
```

#### Get Ride Statistics
```
GET /api/rides/stats
Authorization: Bearer <token>
```

### User Endpoints (Admin Only)

#### Get All Users
```
GET /api/users?page=1&limit=10
Authorization: Bearer <admin_token>
```

#### Get User Statistics
```
GET /api/users/:id/stats
Authorization: Bearer <admin_token>
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 👥 User Roles

- **User**: Can book cycles, view ride history, manage profile
- **Admin**: Full access to all endpoints, can manage stations, cycles, and users

## 📊 Sample Data

After running the seeder, you'll have:

**Users:**
- Admin: `admin@smartcycle.com` / `admin123`
- User: `john@example.com` / `user123`
- User: `jane@example.com` / `user123`

**Stations:**
- Main Campus Station
- Engineering Building Station
- Student Center Station

**Cycles:**
- 8 cycles distributed across stations with QR codes

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- Role-based access control
- CORS enabled for frontend integration

## 📈 Performance

- MongoDB indexing for efficient queries
- Pagination for large datasets
- Optimized database queries with population
- Error handling and logging

## 🚀 Deployment

1. Set environment variables for production
2. Use a production MongoDB instance
3. Set `NODE_ENV=production`
4. Use a strong JWT secret
5. Enable HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details 