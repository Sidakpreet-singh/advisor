const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    sessionId: String,
    userMessage: String,
    botReply: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Conversation', conversationSchema);
