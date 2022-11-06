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
                url: {
                    type: 'string'
                }
            },
            required: ['tagName']
        };

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
                }
            },
            required: ['feedId']
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
                    maximum: 100,
                    default: 10
                }
            },
            required: ['articleId', 'limit']
        };

        req.query.limit = Number(req.query.limit);
        const valid = ajv.validate(schema, req.query);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'query')
            });
        }
        next();
    }
};