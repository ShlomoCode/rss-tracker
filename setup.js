const fs = require('fs');
const prompts = require('prompts');
const { validate: emailValidate } = require('deep-email-validator');
require('colors');

async function emailValidator (email) {
    const validateEmail = await emailValidate({
        email,
        validateRegex: true,
        validateMx: true,
        validateTypo: false,
        validateDisposable: true,
        validateSMTP: false
    });
    return validateEmail.valid;
}

const questions = [
    {
        type: 'text',
        name: 'GMAIL_USER',
        message: 'Gmail user',
        validate: async value => await emailValidator(value) ? true : 'Please enter a valid email address (example: yossi56@gmail.com).'
    },
    {
        type: 'password',
        name: 'GMAIL_PASSWORD',
        message: 'Gmail password (app password)',
        validate: value => value.length === 16 ? true : 'Enable two-step verification and use a 16-character app password (https://support.google.com/accounts/answer/185833)'
    },
    {
        type: 'text',
        name: 'MONGO_URI',
        message: 'MongoDB URI',
        validate: value => /^mongodb(\+srv)?:\/\//.test(value) ? true : 'Please enter a valid MongoDB URI (example: mongodb://localhost:27017/feeds)'
    },
    {
        type: 'number',
        name: 'MAX_FEEDS_PER_USER',
        message: 'Max feeds per user - leave blank to default: 10',
        initial: 10,
        min: 1,
        max: 200,
        validate: value => (!value || value > 0) ? true : 'Please enter a number greater than 0. leave blank to default: 10'
    },
    {
        type: 'number',
        name: 'PORT',
        message: 'Port to listen. leave blank to default: 4200',
        initial: 4200,
        min: 1,
        max: 65535
    },
    {
        type: 'text',
        name: 'FRONTEND_URL',
        message: 'FRONTEND URL - for links in emails. leave blank to default - localhost (for development)'
    },
    {
        type: 'multiselect',
        name: 'ALLOWED_DOMAINS',
        message: 'Allowed domains for create feed. leave blank to allow all domains',
        choices: [
            {
                value: 'hm-news.co.il',
                selected: true
            },
            {
                value: 'www.jdn.co.il',
                selected: true
            },
            {
                value: 'www.93fm.co.il',
                selected: true
            },
            {
                value: 'www.bahazit.co.il',
                selected: true
            },
            {
                value: 'www.geektime.co.il',
                selected: true
            },
            {
                value: 'internet-israel.com',
                selected: true
            }
        ],
        hint: 'Use space to select. Press Enter to submit'
    },
    {
        type: 'multiselect',
        name: 'DOMAINS_ALLOWED_ATTACHED_IMAGES',
        message: 'Domains allowed to attach images. leave blank to allow all domains',
        choices: [
            {
                value: 'hm-news.co.il',
                selected: true
            },
            {
                value: 'www.jdn.co.il',
                selected: true
            }
        ]
    }
];

async function checkConfig (config = process.env) {
    const variables = questions.map(q => q.name);
    const missingVariables = [];
    for (const variable of variables) {
        if (!config[variable]) {
            missingVariables.push(variable);
        }
    }
    if (missingVariables.length) {
        console.log(`Config error: missing key(s): ${missingVariables.join(', ')}`.red);
        console.log(`You can configure the missing variables by running: ${'npm run configure'.blue}`.grey);
        process.exit(1);
    }
}

async function createConfigFile () {
    console.log('👋 Welcome to the configuration wizard!'.yellow);
    if (fs.existsSync('config.json')) {
        const currentConfig = JSON.parse(fs.readFileSync('config.json'));
        const confirmForceCreate = await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Config file already exists; '.red + 'Do you want to create a new one anyway? '.yellow + `\n${'current config:'.blue}\n${JSON.stringify(currentConfig, null, 2).yellow}\n${'re-create by force?'.red}`
        });
        if (!confirmForceCreate.value) {
            console.log('Goodbye!'.yellow);
            process.exit(0);
        }
    };

    const responses = {};
    for (const question of questions) {
        if (fs.existsSync('config.json')) {
            const currentConfig = JSON.parse(fs.readFileSync('config.json'));
            if (currentConfig[question.name]) {
                const confirmOverride = await prompts({
                    type: 'confirm',
                    name: 'value',
                    message: 'This variable already exists: '.red + `Do you want to override "${question.name.blue}" (${'current value: '.grey + String(currentConfig[question.name]).blue})?`,
                    initial: false
                });
                if (!confirmOverride.value) {
                    responses[question.name] = currentConfig[question.name];
                    continue;
                }
            }
        }
        const answer = await prompts(question);
        responses[question.name] = answer[question.name];
    }

    const defaults = [
        { name: 'MAX_FEEDS_PER_USER', value: 10 },
        { name: 'PORT', value: 4000 },
        { name: 'FRONTEND_URL', value: 'http://localhost:' + responses.PORT }
    ];

    for (const defaultConfig of defaults) {
        if (!responses[defaultConfig.name]) {
            responses[defaultConfig.name] = defaultConfig.value;
        }
    }

    const confirmResult = await prompts({
        type: 'confirm',
        name: 'value',
        message: '👀 The following config will be saved to config.json:\n'.blue + JSON.stringify(responses, null, 2).yellow + '\ncontinue?',
        initial: true
    });
    if (!confirmResult.value) {
        console.log('Goodbye!'.yellow);
        process.exit(0);
    }

    checkConfig(responses);
    fs.writeFileSync('config.json', JSON.stringify(responses, null, 2));
    console.log('🎉 Config file created successfully!\n'.green + 'ℹ️ You can now run the server via command: '.grey + 'npm start'.blue);
    process.exit(0);
}

if (require.main === module) {
    createConfigFile();
}

module.exports = () => {
    // set config to process.env and validate the config
    let config = {};
    if (fs.existsSync('config.json')) {
        config = JSON.parse(fs.readFileSync('config.json'));
    }
    process.env = {
        ...config,
        ...process.env
    };
    checkConfig();
};