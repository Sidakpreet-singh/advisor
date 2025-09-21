const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const postRoutes = require('./routes/posts');
const Post = require('./models/Posts');
const authRoutes = require('./routes/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Gemini SDK
const bodyParser = require('body-parser');
const path = require('path');
const Conversation = require('./models/Conversation'); // New import for chat memory

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const SESSION_ID = "123456"; // Static session ID for now
app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini API client
const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Route to handle conversation with context
app.post("/chatbot", async (req, res) => {
    const { message } = req.body;

    try {
        // Fetch conversation history for this session
        const previousMessages = await Conversation.find({ sessionId: SESSION_ID }).sort({ timestamp: 1 });

        // Convert to Gemini format
        const chatHistory = previousMessages.map(msg => [
            { role: "user", parts: [{ text: msg.userMessage }] },
            { role: "model", parts: [{ text: msg.botReply }] }
        ]).flat();

        // Start chat with history
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
        const chat = model.startChat({ history: chatHistory });

        const result = await chat.sendMessage(message);
        const botReply = result.response.text();

        // Clean and structure the response with better formatting
        const structuredReply = formatResponse(botReply);

        // Save new message to DB
        await Conversation.create({
            sessionId: SESSION_ID,
            userMessage: message,
            botReply: structuredReply
        });

        res.json({ reply: structuredReply });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Gemini API request failed." });
    }
});

// Function to clean and structure the response text with proper spacing
function formatResponse(responseText) {
    // Ensure there is a bullet point for each key idea or sentence
    if (responseText) {
        // Split the text into sentences and add bullet points to each
        responseText = responseText.split('. ').map(line => `<li>${line.trim()}.</li>`).join('');
        
        // Wrap the content in a list to make it appear cleaner
        responseText = `<ul>${responseText}</ul>`;
        
        // Optionally, add some headings or introductory text
        responseText = `<p><strong>Here is your answer:</strong></p>` + responseText;
    }

    return responseText;
}

// Route to get chat history
app.get("/chat-history", async (req, res) => {
    try {
        const history = await Conversation.find({ sessionId: SESSION_ID }).sort({ timestamp: 1 });
        res.json({ history });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

// Other routes
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("Failed to connect to MongoDB", err));

// Fetch posts from DB
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('userId');
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
