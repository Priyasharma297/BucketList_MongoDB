const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    // Get the token from cookies
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        // Verify the token using JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user info to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // Handle invalid or expired token
        return res.status(400).json({ message: "Invalid token." });
    }
};
