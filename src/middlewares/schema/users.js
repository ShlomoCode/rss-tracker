const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: false });
const validator = require('validator');

module.exports = {
    login: (req, res, next) => {
        if (!Object.keys(req.body).length) return res.status(400).json({ message: 'There was no body found or no json format' });
        const schema = {
            type: 'object',
            properties: {
                email: { type: 'string' },
                password: { type: 'string' }
            },
            required: ['email', 'password']
        };

        const valid = ajv.validate(schema, req.body);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'body')
            });
        }
        next();
    },
    signup: (req, res, next) => {
        if (!Object.keys(req.body).length) return res.status(400).json({ message: 'There was no body found or no json format' });
        const schema = {
            type: 'object',
            properties: {
                email: { type: 'string' },
                password: { type: 'string' }
            },
            required: ['email', 'password']
        };

        const valid = ajv.validate(schema, req.body);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'body')
            });
        }
        next();
    },
    verifyEmail: (req, res, next) => {
        if (!Object.keys(req.body).length) return res.status(400).json({ message: 'There was no body found or no json format' });
        const schema = {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    minLength: 5,
                    maxLength: 5
                }
            },
            required: ['code']
        };

        const valid = ajv.validate(schema, req.body);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'body')
            });
        }

        if (!validator.isNumeric(req.body.code)) {
            return res.status(400).json({
                message: 'body/code is not valid: must be digits'
            });
        }
        next();
    },
    forgotPassword: (req, res, next) => {
        if (!Object.keys(req.body).length) return res.status(400).json({ message: 'There was no body found or no json format' });
        const schema = {
            type: 'object',
            properties: {
                email: { type: 'string' }
            },
            required: ['email']
        };

        const valid = ajv.validate(schema, req.body);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'body')
            });
        }
        next();
    },
    changePassword: (req, res, next) => {
        if (!Object.keys(req.body).length) return res.status(400).json({ message: 'There was no body found or no json format' });
        const schema = {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    minLength: 5,
                    maxLength: 5
                },
                email: { type: 'string' },
                newPassword: { type: 'string' }
            },
            required: ['token', 'email', 'newPassword']
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