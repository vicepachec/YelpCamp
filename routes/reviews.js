const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review')
const reviews = require('../controlers/reviews')
const { reviewValidator, isLoggedIn, isReviewOwner } = require('../utils/middleware')

router.post('/', isLoggedIn, reviewValidator, reviews.addReview)

router.delete('/:reviewId', isLoggedIn, isReviewOwner, reviews.deleteReview)

module.exports = router;