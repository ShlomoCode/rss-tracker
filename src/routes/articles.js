const express = require('express');
const router = express.Router();
const checkLogin = require('@middlewares/checkLogin');
const checkVerification = require('@middlewares/checkVerification');
const checkSchema = require('@middlewares/schema/articles');

const {
    getArticleById,
    getArticlesByFeedId,
    getArticlesByTagName,
    getRelatedArticles
} = require('@controllers/articles');

router.use(checkLogin);
router.use(checkVerification);

router.get('/by-feed-id', checkSchema.getArticlesByFeedId, getArticlesByFeedId);
router.get('/:by-tag-name', checkSchema.getArticlesByTagName, getArticlesByTagName);
router.get('/related-articles', checkSchema.getRelatedArticles, getRelatedArticles);
router.get('/:articleId', checkSchema.getArticleById, getArticleById);

module.exports = router;