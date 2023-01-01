const Article = require('../models/article');
const Feed = require('../models/feed');
const { exposeArticle, exposeFeed } = require('@/utils/exposes');
const ms = require('ms');

async function getArticleById (req, res) {
    const { _id: userId } = res.locals.user;
    const articleId = req.params.articleId;
    const article = await Article.findById(articleId);
    if (!article) {
        return res.status(404).json({
            message: 'Article not found'
        });
    }

    if (!article.readBy.includes(userId)) {
        await article.updateOne({ $addToSet: { readBy: userId } });
    }

    res.status(200).json({
        article: exposeArticle(article, userId)
    });
}

async function getArticlesByFeedId (req, res) {
    const { feedId, limit, offset } = req.query;
    const { _id: userId } = res.locals.user;

    const feed = await Feed.findById(feedId);
    if (!feed) {
        return res.status(404).json({
            message: 'feed not found'
        });
    }

    const articles = await Article.find({ feeds: feedId }).sort({ published: -1 }).limit(limit).skip(offset).sort({ published: -1 });
    const totalArticles = await Article.count({ feeds: feedId });

    res.status(200).json({
        totalArticles,
        articles: articles.map(article => exposeArticle(article, userId, { onlyDescription: true })),
        feed: exposeFeed(feed)
    });
}

async function getArticlesByTagName (req, res) {
    const { tagName, limit, offset } = req.query;
    const { _id: userId } = res.locals.user;

    const articles = await Article.find({ tags: tagName }).limit(limit).skip(offset).sort({ published: -1 });
    const totalArticles = await Article.count({ tags: tagName });

    res.status(200).json({
        totalArticles,
        articles: articles.map(article => exposeArticle(article, userId, { onlyDescription: true }))
    });
}

async function getRelatedArticles (req, res) {
    const { _id: userId } = res.locals.user;
    const articleId = req.query.articleId;
    const limitResults = req.query.limit;

    const article = await Article.findById(articleId);
    if (!article) {
        return res.status(404).json({
            message: 'Article not found'
        });
    }

    const articles = await Article.find({
        tags: { $in: article.tags },
        _id: { $ne: articleId },
        published: { $gte: new Date(Date.now() - ms('5d')) },
        readBy: { $ne: userId }
    }).limit(limitResults).sort({ published: -1 });

    return res.status(200).json({
        articles: articles.sort(() => Math.random() - 0.5).map(article => exposeArticle(article, userId, { onlyDescription: true }))
    });
}

async function getTagsList (req, res) {
    const tags = await Article.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    res.status(200).json({
        tags: tags.map(tag => {
            return {
                name: tag._id, count: tag.count
            };
        }).sort((a, b) => b.count - a.count)
    });
}

async function getUnreadArticles (req, res) {
    const { _id: userId } = res.locals.user;
    const { limit, offset } = req.query;

    const userSubscriptions = await Feed.find({ subscribers: userId }).select('_id');
    const articles = await Article.find({ readBy: { $ne: userId }, feeds: { $in: userSubscriptions } }).sort({ published: -1 }).limit(limit).skip(offset);
    const totalArticles = await Article.count({ readBy: { $ne: userId }, feeds: { $in: userSubscriptions } }).sort({ published: -1 });

    res.status(200).json({
        totalArticles,
        articles: articles.map(article => exposeArticle(article, userId, { onlyDescription: true }))
    });
}

async function markArticleAsRead (req, res) {
    const { _id: userId } = res.locals.user;
    const { articleId } = req.body;

    const article = await Article.findById(articleId);

    if (!article) {
        return res.status(404).json({
            message: 'Article not found'
        });
    }

    await article.updateOne({ $addToSet: { readBy: userId } });

    res.status(200).json({
        article: exposeArticle(article, userId, { onlyDescription: true })
    });
}

module.exports = {
    getArticlesByFeedId,
    getArticleById,
    getArticlesByTagName,
    getRelatedArticles,
    getTagsList,
    getUnreadArticles,
    markArticleAsRead
};