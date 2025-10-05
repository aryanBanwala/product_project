// src/routes/user.route.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/signup', auth.userAuth, userController.signup);

module.exports = router;