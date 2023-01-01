const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: false });

module.exports = (req, res, next) => {
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
};