const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const hbs = require('hbs');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config({ path: './.env' });

const app = express();

// Set view engine
app.set('view engine', 'hbs');

// Register Handlebars partials and helpers
hbs.registerPartials(path.join(__dirname, '/views/partials'));
hbs.registerHelper('equals', function (a, b) {
    return a === b;
});

// Middleware setup
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Session setup (mostly for fallback use or storing temporary flags)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// ✅ Middleware to inject decoded user data (for every page render)
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded; // available in all views
            req.user = decoded;        // available in route logic
        } catch (err) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

// Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/bucket', require('./routes/bucket'));
app.use('/api', require('./routes/itinerary'));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
