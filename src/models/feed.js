const mongoose = require('mongoose');

const feedSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    url: { type: String, match: /^https?:\/\/[\w-]+\.\w{2,6}/ },
    lastCheckedAt: { type: Date, default: Date.now },
    subscribers: { type: Array, default: [] }
});

module.exports = mongoose.model('Feed', feedSchema);
