const express = require("express");
const app = express();
const mongoose = require('mongoose');
const morgan = require("morgan");
const config = require('./config.json')

// התחברות לדאטה בייס
mongoose.connect(`mongodb+srv://${config.MONGO.USERNAME}:${config.MONGO.PASSWORD}@${config.MONGO.URL}`,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on('connected', ()=>{
    console.log("mongoDB connected!");
})

app.use(morgan("dev"))
