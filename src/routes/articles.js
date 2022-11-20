const express = require('express');
const router = express.Router();
const checkLogin = require('@middlewares/checkLogin');
const checkVerification = require('@middlewares/checkVerification');
const checkSchema = require('@middlewares/schema/articles');

const {
    getArticleById,
    getArticlesByFeedId,
    getArticlesByTagName,
    getRelatedArticles,
    getTagsList,
    getUnreadArticles,
    markArticleAsRead
} = require('@controllers/articles');

router.use(checkLogin);
router.use(checkVerification);

router.get('/getArticlesByFeedId', checkSchema.getArticlesByFeedId, getArticlesByFeedId);
router.get('/getArticlesByTagName', checkSchema.getArticlesByTagName, getArticlesByTagName);
router.get('/getRelatedArticles', checkSchema.getRelatedArticles, getRelatedArticles);
router.get('/getTagsList', getTagsList);
router.get('/getUnreadArticles', checkSchema.getUnreadArticles, getUnreadArticles);
router.post('/markArticleAsRead', checkSchema.markArticleAsRead, markArticleAsRead);
router.get('/getArticleById/:articleId', checkSchema.getArticleById, getArticleById);

module.exports = router;