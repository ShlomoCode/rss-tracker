const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('express-async-errors');
require('colors');
const fs = require('fs');
const path = require('path');

require('module-alias/register');
const setAndCheckConfig = require('./setup');
setAndCheckConfig();
const backendWorker = require('./src/server/worker');

process.env.PROD = process.env.NODE_ENV === 'production';
if (process.env.PROD) {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const generalRoutes = require('./src/routes/general');
const usersRoutes = require('@routes/users');
const feedsRoutes = require('@routes/feeds');
const subscriptionsRoutes = require('@routes/subscriptions');
const articlesRoutes = require('@routes/articles');

app.use('/api/general', generalRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/feeds', feedsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/articles', articlesRoutes);
app.all('/api/*', (req, res) => res.status(404).json({ message: 'Route or method Not found' }));
if (fs.existsSync(path.join(__dirname, 'public'))) {
    app.use(express.static('public'));
    app.all('*', (req, res) => res.sendFile('index.html', { root: 'public' }));
} else {
    console.log('No public folder found, serving only API routes'.red);
    app.all('*', (req, res) => res.status(404).send(process.env.PROD ? 'Not Found' : 'Static files Not found, please run "npm run build" in client directory and copy the "dist" folder content to the "public" folder in the this server directory'));
}

app.use((error, req, res, next) => {
    res.status(500).json({
        message: process.env.PROD ? 'Internal server error' : error.message
    });
});

(async () => {
    console.log('Connecting to MongoDB...'.yellow);
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('🔌 MongoDB connected successfully'.green);

    const http = require('http');
    const port = process.env.PORT;
    const server = http.createServer(app);
    server.listen(port);
    console.log(`🚀 Server is running on port: ${port}. public url: ${process.env.FRONTEND_URL.grey}`.blue);

    do {
        await backendWorker();
    } while (true);
})();