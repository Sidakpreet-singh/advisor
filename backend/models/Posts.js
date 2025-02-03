
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Assuming you're linking the post to a user
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    image: { type: String, default: "" }, // Optional image field
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // Assuming you're storing user IDs for likes
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model("Posts", postSchema);
module.exports = Post;
