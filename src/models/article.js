const mongoose = require('mongoose');
const ms = require('ms');

const articleSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    feeds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Feed',
        required: true
    },
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    content: { type: String },
    author: { type: String },
    image: { type: String },
    tags: { type: [String] },
    creator: { type: String },
    published: { type: Date, required: true },
    created: { type: Date, default: Date.now },
    expires: { type: Date, default: Date.now, expires: ms('30 days') / 1000 },
    readBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    }
});

module.exports = mongoose.model('Article', articleSchema);
