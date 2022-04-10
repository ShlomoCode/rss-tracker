const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config({ path: 'config.env' });
const cookieParser = require('cookie-parser');
const processingFeeds = require('./src/server/main');

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-Wite, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST', 'PATCH', 'DELETE', 'GET');
        return res.status(200).json({
            message: 'OPTIONS'
        });
    }
    next();
});

// Routes
const usersRoutes = require('./src/api/routes/users');
const feedsRoutes = require('./src/api/routes/feeds');
const getStatus = require('./src/api/routes/status');

app.use('/api/users', usersRoutes);
app.use('/api/feeds', feedsRoutes);
app.use('/api/status', getStatus);

app.use(cookieParser());

const checkLoginClient = require('./src/client/middlewares/checkLogin');
const UnsubscribeMiddleware = require('./src/client/middlewares/unsubscribe');

app.use('/login', checkLoginClient, express.static('src/client/static/login'));
app.use('/', checkLoginClient, express.static('src/client/static/main'));
app.use('/images', express.static('src/client/static/images'));
app.use('/unsubscribe', UnsubscribeMiddleware, express.static('src/client/static/unsubscribe'));

// for 404 page
app.use('*', express.static('src/client/static/404'));

app.use((error, req, res, next) => {
    res.status(500);
    res.json({
        error: {
            message: error.message
        }
    });
});

/**
 * Run Back And base
 */
function sleep (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
(async () => {
    // התחברות לדאטה בייס
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
const port = process.env.PORT || 80;

const server = http.createServer(app);

server.listen(port);
