//various imports of middleware
const express = require('express'); //web frameworks used to handle HTTP requests
const cors = require('cors'); //allows backend to accept requests
const helmet = require('helmet'); //adds security headers to responses
const ratelimit = require('express-rate-limit'); //library that limits how many requests a user can make in a time frame
const { testConnection } = require('./config/database'); //imports the func from database.js, called during app startup
const authRoutes = require('./routes/authRoutes');

//app initialization
const app = express(); //app will be used to define shortcuts to routes

//security and middleware setup
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

//rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// middleware 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//testing the database
testConnection();

//checkiing the route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Lost and Found API is running',
        timestamp: new Date().toISOString()
    });
});

//mounting api routes
app.use('/api/auth', authRoutes);

// 404 fallback
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

//
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

module.exports = app;