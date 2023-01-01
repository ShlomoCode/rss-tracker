const mongoose = require('mongoose');
const ms = require('ms');

const sessionSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    uuid: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now },
    expires: { type: Date, default: Date.now, expires: ms('45 days') / 1000 }
});

module.exports = mongoose.model('Session', sessionSchema);