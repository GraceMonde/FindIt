//various imports of middleware
const express = require('express'); //web frameworks used to handle HTTP requests

//checking for environment variables
if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
}

//console.log('Express version:', require('express/package.json').version);
const cors = require('cors'); //allows backend to accept requests
const helmet = require('helmet'); //adds security headers to responses
const rateLimit = require('express-rate-limit'); //library that limits how many requests a user can make in a time frame
const { testConnection } = require('./config/database'); //imports the func from database.js, called during app startup
const authRoutes = require('./routes/authRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const foundItemRoutes = require('./routes/foundItemRoutes');

//app initialization
const app = express(); //app will be used to define shortcuts to routes

//security and middleware setup
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

//rate limiter only allows 100 requests per 15 minutes per IP 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

//for logging, debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});


app.use('/api/', limiter);

// middleware 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//testing the database conn when starting
testConnection();

//checkiing the route health
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Lost and Found API is running',
        timestamp: new Date().toISOString()
    });
});

//mounting api routes
app.use('/api/auth', authRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/found-items', foundItemRoutes);

// 404 fallback
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// global error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

//export the express app
module.exports = app;