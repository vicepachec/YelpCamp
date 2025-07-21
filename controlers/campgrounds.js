const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY

module.exports.home = async (req, res) => {
	const campgrounds = await Campground.find({})
	res.render('campgrounds/index', {campgrounds})
};

module.exports.newForm = (req, res) => {
	res.render('campgrounds/new')
};

module.exports.createCamp = async(req, res) => {
	const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.features[0].geometry;
	campground.author = req.user._id
	const imgs = req.files.map (f => ({ url: f.path, filename: f.filename }))
	campground.images.push(...imgs)
	if (campground.images.length > 5){
		req.flash('error', 'Max number of images allowed is 5')
		return res.redirect('/campgrounds/new')
	}
	await campground.save();
	req.flash('success', 'Campground created successfully')
	res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.showpage = async (req, res) => {
	const { id } = req.params
	const campground = await Campground.findById(id).populate({
		path:'reviews', populate: { path:'author' }}).populate('author');
	res.render('campgrounds/show', { campground, maptilerApiKey: process.env.MAPTILER_API_KEY })
}

module.exports.editPage = async (req, res) => {
	const { id } = req.params
	const campground = await Campground.findById(id)
	res.render('campgrounds/edit', { campground })
}

module.exports.updateCamp = async(req, res) => {
	const { id } = req.params
	console.log(req.body)
	const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
	const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
	campground.geometry = geoData.features[0].geometry;
	const imgs = req.files.map (f => ({ url: f.path, filename: f.filename }))
	console.log(imgs)
	if (campground.images.length + imgs.length > 5){
		for (let img of imgs){
			await cloudinary.uploader.destroy(img.filename)
		}
		req.flash('error', 'Max number of images allowed is 5')
		return res.redirect('/campgrounds/new')
	}
	campground.images.push(...imgs)
	await campground.save();
	if(req.body.deleteImages){
		for(let filename of req.body.deleteImages){
			await cloudinary.uploader.destroy(filename)
		}
		await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}})
	}
	req.flash('success', 'Campground updated successfully')
	res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCamp = async(req, res) => {
	const { id } = req.params
	await Campground.findByIdAndDelete(id)
	req.flash('success', 'Campground deleted successfully')
	res.redirect('/campgrounds')
}

