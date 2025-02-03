const jwt = require("jsonwebtoken");
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        // Remove "Bearer" from token string if it exists
        const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7) : token;
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);  // Use your secret key
        const user = await User.findById(decoded.userId);
        req.user = user;  // Attach the entire user object to the request object (not just the decoded token)
        next();  // Proceed to the next middleware or route handler
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token." });
    }
};

module.exports = { authenticate };
