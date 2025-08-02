# SmartCycle: Digital Cycle Booking System

A complete full-stack application for digital cycle booking with QR code scanning, user authentication, and admin management.

## 🚀 Features

### User Features
- **Authentication**: Secure login/register with JWT tokens
- **QR Code Scanning**: Scan QR codes to start/end rides
- **Real-time Tracking**: View active rides and statistics
- **Ride History**: Complete ride history with details
- **Station Management**: View available stations and cycles
- **Profile Management**: User profile with logout functionality

### Admin Features
- **Admin Dashboard**: System overview and management
- **User Management**: View and manage all users
- **Station Management**: Add/edit cycle stations
- **Cycle Management**: Manage cycles and their status
- **Ride Monitoring**: View all active and completed rides
- **System Statistics**: Real-time system metrics

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **QR Code** generation
- **Express Validator** for input validation

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Expo Barcode Scanner** for QR scanning
- **Expo Secure Store** for token storage
- **React Native Animatable** for animations
- **Linear Gradient** for modern UI

## 📁 Project Structure

```
smartcycle/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & error handling
│   ├── server.js        # Main server file
│   ├── seeder.js        # Database seeding
│   └── package.json
├── frontend/
│   ├── app/            # Expo Router pages
│   ├── screens/        # React Native screens
│   ├── context/        # Authentication context
│   ├── config/         # API configuration
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Expo CLI
- Android Studio / Xcode (for mobile development)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create `.env` file with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smartcycle
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=30d
   QR_SIZE=200
   ```

4. **Seed the database**:
   ```bash
   npm run seed
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - Scan QR code with Expo Go app
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator

## 🔐 Authentication

### Sample Login Credentials

**Admin User:**
- Email: `admin@smartcycle.com`
- Password: `admin123`

**Regular Users:**
- Email: `john@example.com`
- Password: `user123`
- Email: `jane@example.com`
- Password: `user123`

## 📱 App Features

### User Flow
1. **Login/Register**: Secure authentication
2. **Dashboard**: View statistics and quick actions
3. **QR Scanning**: Scan QR codes to start/end rides
4. **Ride Management**: Track active rides and history
5. **Station View**: Browse available stations
6. **Profile**: Manage account and logout

### Admin Flow
1. **Admin Login**: Use admin credentials
2. **Dashboard**: System overview and statistics
3. **User Management**: View and manage users
4. **Station Management**: Add/edit stations
5. **Cycle Management**: Manage cycles and status
6. **Ride Monitoring**: View all rides

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Stations
- `GET /api/stations` - Get all stations
- `POST /api/stations` - Create station (admin)
- `GET /api/stations/:id` - Get station details
- `PUT /api/stations/:id` - Update station (admin)

### Cycles
- `GET /api/cycles` - Get all cycles
- `POST /api/cycles` - Create cycle (admin)
- `GET /api/cycles/:id` - Get cycle details
- `PUT /api/cycles/:id` - Update cycle (admin)
- `GET /api/cycles/qr/:cycleId` - Get cycle by QR

### Rides
- `POST /api/rides/start` - Start a ride
- `POST /api/rides/end` - End a ride
- `GET /api/rides/history` - Get ride history
- `GET /api/rides/me/active` - Get active ride
- `GET /api/rides/stats` - Get ride statistics

### Users (Admin)
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

## 🎨 UI/UX Features

- **Modern Design**: Clean, gradient-based UI
- **Smooth Animations**: React Native Animatable
- **Responsive Layout**: Works on all screen sizes
- **Dark/Light Mode**: Automatic theme switching
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs encryption
- **Input Validation**: Express validator
- **Role-based Access**: Admin/user permissions
- **Secure Storage**: Expo Secure Store
- **CORS Protection**: Cross-origin security

## 📊 Database Schema

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  phone: String,
  isActive: Boolean
}
```

### Stations
```javascript
{
  name: String,
  location: String,
  description: String,
  capacity: Number,
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}
```

### Cycles
```javascript
{
  cycleId: String (unique),
  model: String,
  color: String,
  condition: String,
  status: String (available/in-use/maintenance),
  stationId: ObjectId,
  qrCode: String
}
```

### Rides
```javascript
{
  userId: ObjectId,
  cycleId: ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number,
  cost: Number,
  status: String (active/completed/cancelled),
  startStation: ObjectId,
  endStation: ObjectId
}
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database
2. Configure environment variables
3. Deploy to platforms like:
   - Heroku
   - Railway
   - DigitalOcean
   - AWS

### Frontend Deployment
1. Build the app:
   ```bash
   expo build:android
   expo build:ios
   ```
2. Submit to app stores:
   ```bash
   expo submit:android
   expo submit:ios
   ```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
- Use Expo Go app for testing
- Test on multiple devices
- Verify all user flows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation
- Review console logs
- Test with different devices
- Contact the development team

## 🎯 Future Enhancements

- **Real-time Notifications**: Push notifications for ride updates
- **Payment Integration**: Online payment processing
- **GPS Tracking**: Real-time location tracking
- **Social Features**: User ratings and reviews
- **Analytics Dashboard**: Advanced analytics for admins
- **Multi-language Support**: Internationalization
- **Offline Mode**: Work without internet connection

---

**SmartCycle** - Making cycle booking simple, secure, and efficient! 🚲✨ 