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
const bodyParser = require('body-parser');
const dialogflow = require('@google-cloud/dialogflow');
const fs = require('fs');



// Middleware
const SESSION_ID = "123456";  // Unique session ID for each user

app.use(cors());
app.use(bodyParser.json());
async function detectIntent(message, sessionId) {
    const CREDENTIALS = JSON.parse(fs.readFileSync(path.join(__dirname, "dialogflow-key.json")));
    const PROJECT_ID = CREDENTIALS.project_id;
    
    const sessionClient = new dialogflow.SessionsClient({ credentials: CREDENTIALS });
    
    const sessionPath = `projects/${PROJECT_ID}/agent/sessions/${sessionId}`;
    
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: "en",
            },
        },
    };
    
    try {
        const responses = await sessionClient.detectIntent(request);
        return responses[0].queryResult.fulfillmentText;
    } catch (error) {
        console.error("Dialogflow API Error:", error);
        throw new Error("Error processing message");
    }
}




// Load the service account key JSON file
const CREDENTIALS = JSON.parse(fs.readFileSync(path.join(__dirname, "dialogflow-key.json")));


const sessionClient = new dialogflow.SessionsClient({
    credentials: CREDENTIALS,
});

const PROJECT_ID = CREDENTIALS.project_id;

// Handle user messages
app.post('/send-message', async (req, res) => {
    const userMessage = req.body.message;

    const sessionPath = `projects/${PROJECT_ID}/agent/sessions/${SESSION_ID}`;


    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: userMessage,
                languageCode: 'en',  // Change if needed
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        res.json({ reply: result.fulfillmentText });
    } catch (error) {
        console.error("Dialogflow API Error:", error);
        res.status(500).send("Error processing message");
    }
});

app.post("/chatbot", async (req, res) => {
    const { message } = req.body;
    const sessionId = "123456"; // Static session ID
    
    try {
        const responseText = await detectIntent(message, sessionId);
        res.json({ reply: responseText });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Dialogflow request failed." });
    }
});


app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
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

