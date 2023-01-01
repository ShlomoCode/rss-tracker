const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: false });

module.exports = {
    getArticleById: async (req, res, next) => {
        const schema = {
            type: 'object',
            properties: {
                articleId: {
                    type: 'string',
                    minLength: 24,
                    maxLength: 24
                }
            },
            required: ['articleId']
        };

        const valid = ajv.validate(schema, req.params);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'params')
            });
        }
        next();
    },
    getArticlesByTagName: (req, res, next) => {
        const schema = {
            type: 'object',
            properties: {
                tagName: {
                    type: 'string'
                },
                limit: {
                    type: 'number',
                    minimum: 1,
                    maximum: 50
                },
                offset: {
                    type: 'number',
                    minimum: 0
                }
            },
            required: ['tagName', 'limit']
        };

        if (req.query.offset) req.query.offset = parseInt(req.query.offset);
        req.query.limit = parseInt(req.query.limit);
        const valid = ajv.validate(schema, req.query);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'query')
            });
        }
        next();
    },
    getArticlesByFeedId: (req, res, next) => {
        const schema = {
            type: 'object',
            properties: {
                feedId: {
                    type: 'string',
                    minLength: 24,
                    maxLength: 24
                },
                limit: {
                    type: 'number',
                    minimum: 1,
                    maximum: 50
                },
                offset: {
                    type: 'number',
                    minimum: 0
                }
            },
            required: ['feedId', 'limit']
        };

        req.query.limit = parseInt(req.query.limit);
        if (req.query.offset) req.query.offset = parseInt(req.query.offset);
        const valid = ajv.validate(schema, req.query);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'query')
            });
        }
        next();
    },
    getRelatedArticles: (req, res, next) => {
        const schema = {
            type: 'object',
            properties: {
                articleId: {
                    type: 'string',
                    minLength: 24,
                    maxLength: 24
                },
                limit: {
                    type: 'number',
                    minimum: 1,
                    maximum: 50
                }
            },
            required: ['articleId', 'limit']
        };

        req.query.limit = parseInt(req.query.limit);
        const valid = ajv.validate(schema, req.query);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'query')
            });
        }
        next();
    },
    getUnreadArticles: (req, res, next) => {
        const schema = {
            type: 'object',
            properties: {
                limit: {
                    type: 'number',
                    minimum: 1,
                    maximum: 50
                },
                offset: {
                    type: 'number',
                    minimum: 0
                }
            },
            required: ['limit']
        };

        if (req.query.offset) req.query.offset = parseInt(req.query.offset);
        req.query.limit = parseInt(req.query.limit);
        const valid = ajv.validate(schema, req.query);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'query')
            });
        }
        next();
    },
    markArticleAsRead: (req, res, next) => {
        if (!Object.keys(req.body).length) return res.status(400).json({ message: 'There was no body found or no json format' });
        const schema = {
            type: 'object',
            properties: {
                articleId: {
                    type: 'string',
                    minLength: 24,
                    maxLength: 24
                }
            },
            required: ['articleId']
        };

        const valid = ajv.validate(schema, req.body);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'body')
            });
        }
        next();
    }
};