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

router.get('/by-feed-id/:feedId', checkLogin, checkVerification, checkSchema.getArticlesByFeedId, getArticlesByFeedId);
router.get('/:by-tag-name', checkLogin, checkVerification, checkSchema.getArticlesByTagName, getArticlesByTagName);
router.get('/related-articles', checkLogin, checkVerification, checkSchema.getRelatedArticles, getRelatedArticles);
router.get('/:articleId', checkLogin, checkVerification, checkSchema.getArticleById, getArticleById);

module.exports = router;