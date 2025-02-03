const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔹 Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 🔹 Signup Route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'Signup successful', user });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
