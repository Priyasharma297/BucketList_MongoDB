const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');    // Sessions for individual users
const hbs = require('hbs');                   // For frontend
const dotenv = require('dotenv');             // To manage environment variables
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config({ path: './.env' });

// Register partials and helpers for Handlebars
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('equals', function (a, b) {
    return a === b;
});

const app = express();
app.set('view engine', 'hbs');

// Middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Parse incoming requests
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',  // Use secret from environment
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }  // Session expires after 24 hours
}));

// MongoDB connection using Mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);  // Exit process with failure
    });

// Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/bucket', require('./routes/bucket'));
app.use('/api', require('./routes/itinerary'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} => http://localhost:${PORT}`);
});
