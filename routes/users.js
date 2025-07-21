const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../utils/middleware');
const users = require('../controlers/users');


router.route('/register')
	.get(users.registerPage)
	.post(users.createAccount)

router.route('/login')
	.get(users.loginPage)
	.post(storeReturnTo, passport.authenticate('local',
		{ failureFlash: true, failureRedirect: '/login'}), users.login)

router.get('/logout', users.logoutUser)

module.exports = router;