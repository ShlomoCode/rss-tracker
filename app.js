const express = require("express");
const app = express();
const mongoose = require('mongoose');
const morgan = require("morgan");
const config = require('./config.json')

// התחברות לדאטה בייס
mongoose.connect(config.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on('connected', ()=>{
    console.log("mongoDB connected!");
})

app.use(morgan("dev"))
