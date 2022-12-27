const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    emailProcessed: {
        type: String,
        required: true,
        match: /^[a-z0-9.]+@[a-z0-9]+\.[a-z0-9]{2,}$/i
    },
    emailFront: {
        type: String,
        required: true,
        match: /^[a-z0-9.]+(:?\+[a-z0-9.+]+)?@[a-z0-9]+\.[a-z0-9]{2,}$/i
    },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    registrationDate: { type: Date, default: Date.now },
    enableEmailNotifications: { type: Boolean, default: true },
    allowAttachmentsInEmail: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema);