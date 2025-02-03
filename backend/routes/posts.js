// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");
const { authenticate } = require("../middleware/authenticate"); // Middleware for authentication
const jwt = require("jsonwebtoken"); // Import the jwt module
const Post = require("../models/Posts"); // Import the Post model
const User = require("../models/user"); // Import the User model

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

// Allow only image files (optional but recommended)
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    },
});

// Serve static files from the uploads directory
router.use("/uploads", express.static("uploads"));

// Create a new post
router.post("/create", authenticate, upload.single("image"), async (req, res) => {
    try {
        const { content } = req.body; // Get the post content from the request body
        const userId = req.user._id; // Assuming you have the user info in req.user

        if (!content) {
            return res.status(400).json({ message: "Content is required." });
        }
        // Check if the file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Image upload failed." });
        }

        // Correctly construct the image URL
        const imageUrl = `/uploads/${req.file.filename}`;

        console.log("Uploaded Image Path:", imageUrl); // Debugging
        console.log("User ID:", userId);

        // Create a new post in the database
        const newPost = new Post({
            userId,
            image: imageUrl,
            content,
        });

        await newPost.save(); // Save the post in the database

        return res.status(201).json({ message: "Post created successfully!", post: newPost });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

// Example login route
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(400).json({ message: "User not found" });

        // Verify password (assuming bcrypt is used)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({ token }); // Send the token to the client
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

// Get all posts
router.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find().populate("userId", "name").sort({ createdAt: -1 }); // Sort by newest posts
        res.json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching posts" });
    }
});

// Like/Unlike a post
router.post("/like/:postId", authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id; // Assuming you're using JWT to authenticate users

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Toggle like/unlike
        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            post.likes.addToSet(userId);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error liking/unliking post" });
    }
});

module.exports = router;