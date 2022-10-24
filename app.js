const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('express-async-errors');
require('colors');

require('module-alias/register');
const setAndCheckConfig = require('./setup');
setAndCheckConfig();
const processingFeeds = require('./src/server/main');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* Routes api */
const usersRoutes = require('./src/api/routes/users');
const feedsRoutes = require('./src/api/routes/feeds');
const subscriptionsRoutes = require('./src/api/routes/subscriptions');

app.use('/api/users', usersRoutes);
app.use('/api/feeds', feedsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.get('/api/status', (req, res) => res.status(200).json({ message: 'OK' }));
app.all('*', (req, res) => res.status(404).json({ message: 'Not found' }));

app.use((error, req, res, next) => {
    res.status(500).json({
        message: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
});

/**
* Run Back And base
*/
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
(async () => {
    console.log('connecting to mongo...');
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('mongoDB connected!');

    /**
     * Listening server
     */
    const http = require('http');
    const port = process.env.PORT;
    const server = http.createServer(app);
    server.listen(port);
    console.log(`Server is running on port: ${port}. public url: ${process.env.APP_SITE_ADDRESS}`);

    /**
    * run background process
    */
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