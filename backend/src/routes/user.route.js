// src/routes/user.route.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');

//without auth
router.post('/signup', userController.signup);
router.post('/login',  userController.login);
router.patch('/edit', auth.userAuth, userController.editProfile);

module.exports = router;