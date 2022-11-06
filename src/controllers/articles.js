const Article = require('../models/article');
const Feed = require('../models/feed');
const { exposeArticle, exposeFeed } = require('@/utils/exposes');

async function getArticleById (req, res) {
    const articleId = req.params.articleId;
    const article = await Article.findById(articleId);
    if (!article) {
        return res.status(404).json({
            message: 'Article not found'
        });
    }
    res.status(200).json({
        article: exposeArticle(article)
    });
}

async function getArticlesByFeedId (req, res) {
    const feedId = req.params.feedId;

    const feed = await Feed.findById(feedId);
    if (!feed) {
        return res.status(404).json({
            message: 'feed not found'
        });
    }

    const articles = await Article.find({ feeds: feedId }).sort({ published: -1 });
    if (!articles) {
        return res.status(404).json({
            message: 'Articles not found'
        });
    }
    res.status(200).json({
        articles: articles.map(article => exposeArticle(article, { onlyDescription: true })),
        feed: exposeFeed(feed)
    });
}

async function getArticlesByTagName (req, res) {
    const tagName = req.query.tagName;
    const articles = await Article.find({ tags: tagName }).sort({ published: -1 });
    if (!articles) {
        return res.status(404).json({
            message: 'Articles not found'
        });
    }
    res.status(200).json({
        articles: articles.map(article => exposeArticle(article, { onlyDescription: true }))
    });
}

async function getRelatedArticles (req, res) {
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
        _id: { $ne: articleId }
    }).limit(limitResults);
    return res.status(200).json({
        articles: articles.map(article => exposeArticle(article, { onlyDescription: true }))
    });
}

module.exports = {
    getArticlesByFeedId,
    getArticleById,
    getArticlesByTagName,
    getRelatedArticles
};