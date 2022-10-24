const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now },
    expires: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 45 } // 45 days
});

module.exports = mongoose.model('Session', sessionSchema);