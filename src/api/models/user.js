const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
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
    name: { type: String, match: /[0-9- א-תA-z]{2,15}/, maxLength: 15, required: true },
    verifyEmailStatus: { type: Boolean, default: false },
    verifyEmailCode: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now },
    Permissions: { type: String, default: 'user' },
    lastVerifyEmailSentAt: { type: Date },
});

module.exports = mongoose.model('User', userSchema);