const mongoose = require('mongoose');
const ms = require('ms');

const sessionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('Session', sessionSchema);