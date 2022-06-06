const validators = require('validator');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: false });

module.exports = {
    getFeed: async (req, res, next) => {
        const schema = {
            type: 'object',
            properties: {
                feedID: {
                    type: 'string',
                    minLength: 24,
                    maxLength: 24
                }
            },
            required: ['feedID']
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
    createFeed: (req, res, next) => {
        const schema = {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    minLength: 10
                }
            },
            required: ['url']
        };

        const valid = ajv.validate(schema, req.body);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'body')
            });
        }

        if (!validators.isURL(req.body.url)) {
            return res.status(400).json({
                message: 'url is not valid'
            });
        }
        next();
    }
};