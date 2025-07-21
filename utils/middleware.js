const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundSchema, reviewSchema } = require('../schemas');
const AppError = require('../utils/AppError');
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({storage,
	limits: {
		files: 5,
		fileSize: 5 * 1024 * 1024
	}
})


module.exports.reviewValidator = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body)
	if(error){
		const msg = error.details.map(el => el.message).join(',')
		throw new AppError(msg, 400)
	}else{next()}
}

module.exports.storeReturnTo = (req, res, next) => {
	if (req.session.returnTo) {
		res.locals.returnTo = req.session.returnTo;
	}
	next()
}

module.exports.campgroundValidator = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if(error){
		const msg = error.details.map(el => el.message).join(',')
		throw new AppError(msg, 400)
	}else{next()}
}

module.exports.isLoggedIn = (req, res, next) => {
	if(req.isUnauthenticated()){
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'You must be signed in to do that')
		return res.redirect('/login')
	}
	next()
}

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params
	const campground = await Campground.findById(id);
	if(!campground.author.equals(req.user._id)){
		req.flash('error', "You don't have permission to do that")
		return res.redirect(`/campgrounds/${id}`)
	}
	next();
}

module.exports.isReviewOwner = async (req, res, next) => {
	const { id, reviewId } = req.params
	const review = await Review.findById(reviewId)
	if (!review.author.equals(req.user._id)){
		req.flash('error', "You don't have permission to do that")
		return res.redirect(`/campgrounds/${id}`)
	}
	next();
}

module.exports.campExists = async (req, res, next) => {
	const { id } = req.params
	const campground = await Campground.findById(id)
	if (!campground){
		req.flash('error', 'Campground not found')
		return res.redirect('/campgrounds')
	}
	next()
}

module.exports.multerUploadArray = (req, res, next) => {
    upload.array('image')(req, res, function (err) {
      if (err) {
        console.log("***** PRINT STRINGIFIED ERROR OBJECT:", JSON.stringify(err, undefined, 4));
        if (err instanceof multer.MulterError) {
          // handle specific multer errors as preferred
          if (err.code === 'LIMIT_FILE_COUNT') {
            req.flash('error', 'You can upload a maximum of 4 images.');
          } else if (err.code === 'LIMIT_FILE_SIZE') {
            req.flash('error', 'File size too large. Max size is 4MB per image.');
          } else {
            req.flash('error', err.message);
          }
        } else if (err) {
          // handle any potential unknown errors
          req.flash('error', 'An error occurred during the file upload.');
        }
        return res.redirect('/campgrounds/new');
      }
      // if no errors happen, go to the next middleware
      return next();
    })
  };
