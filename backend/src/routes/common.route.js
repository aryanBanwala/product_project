const express = require('express');
const router = express.Router();
const commonController = require('../controllers/common.controller.js');

// Yeh ek public route hai, iske liye kisi bhi tarah ke authentication ki zaroorat nahi hai.
// Yeh route '/api/config' par available hoga.
router.get('/config', commonController.getAppConfig);

module.exports = router;