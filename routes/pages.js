const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { verifyToken } = require('../middleware/authMiddleware'); // import your middleware
const mysql = require("mysql2");

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/explore', (req, res) => {
    res.render('explore');
});

router.get('/bucketList', verifyToken, (req, res) => {
    res.render('bucketList', { user: req.user });
});

router.get('/user', verifyToken, (req, res) => {
    res.render('user', {
        message: 'User page',
        user: req.user
    });
});


router.get("/profile", verifyToken, async (req, res) => {
    try {
        // Use await to find the user based on the email from the decoded JWT token
        const user = await User.findOne({ email: req.user.email });

        if (!user) {
            return res.redirect("/login");
        }

        // Render the profile page with the user data
        res.render("profile", { user });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.redirect("/login"); // Redirect if there's an error
    }
});

router.get('/story', verifyToken, (req, res) => {
    res.render('story');
});

router.get('/stories', verifyToken, (req, res) => {
    res.render('stories');
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

router.get('/itinerary', verifyToken, (req, res) => {
    res.render('itinerary', { user: req.user });
});


module.exports = router;
