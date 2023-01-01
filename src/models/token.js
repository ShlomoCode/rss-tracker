const mongoose = require('mongoose');
const ms = require('ms');

const tokenSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    type: { type: String, required: true },
    token: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now },
    expires: { type: Date, default: Date.now, expires: ms('1 day') / 1000 }
});

module.exports = mongoose.model('Token', tokenSchema);