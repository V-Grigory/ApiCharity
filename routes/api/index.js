const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/goals', require('./goals'));

module.exports = router;
