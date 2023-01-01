const mongoose = require('mongoose');

const feedSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    title: { type: String, required: true },
    url: { type: String, match: /^https?:\/\/[\w-]+\.\w{2,6}/ },
    subscribers: { type: Array, default: [] }
});

module.exports = mongoose.model('Feed', feedSchema);
