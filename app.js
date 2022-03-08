const express = require("express");
const app = express();
const mongoose = require('mongoose');
const morgan = require("morgan");
const config = require('./config.json')

// התחברות לדאטה בייס
mongoose.connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on('connected', () => {
    console.log("mongoDB connected!");
})

app.use(morgan("dev"))

app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-Wite, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT", "POST", "PETCH", "DELETE", "GET");
        return res.status(200).json({
            message: "GET OPTIONS"
        });
    }
    next();
})

// Routes
const usersRoutes = require('./src/api/routes/users')
const feedsRoutes = require('./src/api/routes/feeds')
const getStatus = require('./src/api/routes/status')

app.use("/api/users", usersRoutes)
app.use("/api/feeds", feedsRoutes)
app.use("/api/status", getStatus)


app.use((req, res, next) => {
    const error = new Error("Not Found")
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

// server
const http = require("http")
const port = 8080

const server = http.createServer(app)

server.listen(port)
