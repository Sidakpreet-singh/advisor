const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
});

// Hash the password before saving the user model
userSchema.pre('save', async function(next) {
    const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

// Check if the model is already defined before defining it
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
