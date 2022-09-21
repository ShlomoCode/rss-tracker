const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config({ path: 'config.env' });
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
require('express-async-errors');
require('colors');
const processingFeeds = require('./src/server/main');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', './src/client/views');
app.use(cookieParser());
app.use(cors());

/* Routes api */
const usersRoutes = require('./src/api/routes/users');
const feedsRoutes = require('./src/api/routes/feeds');
const subscriptionsRoutes = require('./src/api/routes/subscriptions');

app.use('/api/users', usersRoutes);
app.use('/api/feeds', feedsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.get('/api/status', (req, res) => res.status(200).json({ message: 'OK' }));
app.all('/api/*', (req, res) => res.status(404).json({ message: 'Not found' }));

/* client */
const checkLoginClient = require('./src/client/middlewares/checkLogin');
const checkVerificationClient = require('./src/client/middlewares/checkVerification');
const renders = {
    main: require('./src/client/renders/main'),
    verify: require('./src/client/renders/verify'),
    unsubscribe: require('./src/client/renders/unsubscribe')
};

app.use(express.static('src/client/views', { index: false }));
app.use('/images', express.static('src/client/images'));
app.get('/login', checkLoginClient, (req, res) => res.sendFile(path.join(__dirname, 'src/client/views/login', 'index.html')));
app.get('/verify', checkLoginClient, checkVerificationClient, renders.verify);
app.get('/unsubscribe', checkLoginClient, checkVerificationClient, renders.unsubscribe);
app.get('/', checkLoginClient, checkVerificationClient, renders.main);
app.all('*', (req, res) => res.status(404).sendFile(path.join(__dirname, 'src/client/views', '404.html')));

app.use((error, req, res, next) => {
    res.status(500).json({
        message: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
});

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    console.log('Config Error:', 'Please set GMAIL_USER and GMAIL_PASSWORD environment variables'.red);
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.log('Config Error:', 'Please set JWT_SECRET environment variable'.red);
    process.exit(1);
}

/* Set app url */
process.env.APP_URL = process.env.WEB_SITE_ADDRESS || (process.env.HEROKU_APP_NAME ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : `http://localhost:${process.env.PORT || 80}`);

/**
 * Run Back And base
 */
function sleep (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
(async () => {
    console.log('connecting to mongo...');
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('mongoDB connected!');
    do {
        const resp = await processingFeeds();
        const ms = 1000 * 60 * 1; // 1 minute
        if (resp === 'Wait!') {
            console.log(`Waiting ${ms} milliseconds...`);
            await sleep(ms);
            console.log('Waiting completed!');
        }
    } while (true);
})();

/**
 * Listening server
 */
const http = require('http');
const port = process.env.PORT || 4000;
const server = http.createServer(app);
server.listen(port);
console.log(`Server is running on port ${port} - ${process.env.APP_URL}`);