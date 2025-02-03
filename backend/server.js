const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const postRoutes = require('./routes/posts');
const Post = require('./models/Posts'); // Import the Post model
const authRoutes = require('./routes/auth'); // Assuming you have a separate file for post routes
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');


// Middleware

app.use(cors());

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.log("Failed to connect to MongoDB", err);
    });

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.get('/api', (req, res) => {
    res.send('API is working');
});

// Fetch posts from the database
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('userId');  // Fetch posts from the database
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
});
``
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Like a post
app.post('/like/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            post.likes += 1;  // Increase the like count
            await post.save();
            res.json({ message: 'Post liked successfully' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error liking post' });
    }
});

// Unlike a post
app.post('/unlike/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            post.likes -= 1;  // Decrease the like count
            await post.save();
            res.json({ message: 'Post unliked successfully' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error unliking post' });
    }
});

