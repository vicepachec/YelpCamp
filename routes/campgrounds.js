const express = require('express');
const router = express.Router();
const { isLoggedIn, isAuthor, campExists, campgroundValidator, multerUploadArray } = require('../utils/middleware')
const campgrounds = require('../controlers/campgrounds');

router.route('/')
	.get(campgrounds.home)
	.post(isLoggedIn, multerUploadArray, campgroundValidator, campgrounds.createCamp)

router.get('/new', isLoggedIn, campgrounds.newForm);

router.route('/:id')
	.get(campExists, campgrounds.showpage)
	.put(isLoggedIn, campExists, isAuthor, multerUploadArray, campgroundValidator, campgrounds.updateCamp)
	.delete(isLoggedIn, campExists, isAuthor, campgrounds.deleteCamp)

router.get('/:id/edit', isLoggedIn, campExists, isAuthor, campgrounds.editPage)

module.exports = router