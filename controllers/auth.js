const jwt = require('jsonwebtoken');
const User = require('../models/userModel');  // MongoDB User model
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary config from cloudinary.js
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// REGISTER
exports.register = async (req, res) => {
    const { name, email, password, passwordConfirmed } = req.body;

    try {
        // Check if the email is already taken
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { message: 'Email is already in use, use another one.' });
        }

        // Check if passwords match
        if (password !== passwordConfirmed) {
            return res.render('register', { message: 'Password does not match!' });
        }

        // Create a new user and save to MongoDB
        const newUser = new User({ name, email, password });
        await newUser.save();

        return res.render('register', { message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

// LOGIN
// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.render('login', { message: 'Email or password is incorrect' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

        // Set token in cookie
       const isProduction = process.env.NODE_ENV === 'production';

res.cookie('token', token, {
  httpOnly: true,
  secure: isProduction, // ✅ use false in localhost/dev
  sameSite: 'Strict',
  maxAge: 1000 * 60 * 60 * 24 // 1 day
});


        return res.render('user', { message: 'Login successful', user });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};


// PROFILE UPDATE
exports.updateProfile = [
    upload.single('image'), // Handle image upload
    async (req, res) => {
        const { address, city, mobile, age, gender } = req.body;
        const user = req.user; // Retrieved from JWT middleware

        let profileImageUrl = null;

        try {
            // If there is an image, upload it to Cloudinary
            if (req.file) {
                profileImageUrl = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'user_profiles' },
                        (error, result) => {
                            if (error) return reject(new Error('Image upload failed'));
                            resolve(result.secure_url);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });
            }

            // Update the user's profile in MongoDB
            await updateUserProfile(address, city, mobile, age, gender, profileImageUrl, user.email);

            return res.json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
];

// Helper function to update profile in MongoDB
async function updateUserProfile(address, city, mobile, age, gender, profileImageUrl, email) {
    try {
        await User.updateOne(
            { email },
            {
                $set: {
                    address,
                    city,
                    mobile,
                    age,
                    gender,
                    ...(profileImageUrl && { profileImage: profileImageUrl }) // only update if image exists
                }
            }
        );
    } catch (error) {
        throw new Error('Error updating user profile');
    }
}
