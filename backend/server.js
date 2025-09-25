require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const restaurantRoutes = require('./routes/restaurants');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const loyaltyRoutes = require('./routes/loyalty');
const socialRoutes = require('./routes/social');
const analyticsRoutes = require('./routes/analytics');
const notificationsRoutes = require('./routes/notifications');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

app.get('/', (req, res) => {
  res.send('Go-to-Resto Backend API');
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
