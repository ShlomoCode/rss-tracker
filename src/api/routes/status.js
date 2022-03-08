const express = require('express')
const router = express.Router()

const { getStatus } = require('../controllers/status');

router.get("/", getStatus);

module.exports = router;