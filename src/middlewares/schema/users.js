const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: false });

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
                password: { type: 'string' },
                name: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 15
                }
            },
            required: ['email', 'password', 'name']
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
        const schema = {
            type: 'object',
            properties: {
                verifyCode: {
                    type: 'string',
                    minLength: 5,
                    maxLength: 5
                }
            },
            required: ['verifyCode']
        };

        const valid = ajv.validate(schema, req.query);
        if (!valid) {
            return res.status(400).json({
                message: 'request is not valid',
                errors: ajv.errorsText(valid.errors).replaceAll('data', 'params')
            });
        }

        if (!/[0-9]{5}/.test(req.query.verifyCode)) {
            return res.status(400).json({
                message: 'verify code is not valid - must be 5 digits'
            });
        }
        next();
    },
    resetPassword: (req, res, next) => {
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
    resetPasswordConfirm: (req, res, next) => {
        if (!Object.keys(req.body).length) return res.status(400).json({ message: 'There was no body found or no json format' });
        const schema = {
            type: 'object',
            properties: {
                resetPasswordToken: {
                    type: 'string',
                    minLength: 5,
                    maxLength: 5
                },
                email: { type: 'string' },
                newPassword: { type: 'string' }
            },
            required: ['resetPasswordToken', 'email', 'newPassword']
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
                oldPassword: { type: 'string' },
                newPassword: { type: 'string' }
            },
            required: ['oldPassword', 'newPassword']
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