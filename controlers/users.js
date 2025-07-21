const User = require('../models/user')

module.exports.registerPage = (req, res) => {
	res.render('users/register')
}

module.exports.createAccount = async(req, res) => {
	try{
		const { email, username, password } = req.body 
		const user = new User({email, username});
		const registedUser = await User.register(user, password);
		req.logIn(registedUser, err => {
			if(err) return next(err);
			req.flash('success', 'Welcome to Yelp Camp!');
			res.redirect('/campgrounds');
		})
	}
	catch(e){
		req.flash('error', e.message)
		res.redirect('/register')
	}
}

module.exports.loginPage  = (req, res) => {
	res.render('users/login')
}

module.exports.login = (req, res) => {
	req.flash('success', 'Welcome back!');
	const redirectUrl = res.locals.returnTo || '/campgrounds';
	res.redirect(redirectUrl)
}

module.exports.logoutUser = (req, res) => {
	req.logout( function (err) {
		if (err) {
			return next(err);
		}
		req.flash('success', 'Logged out successfully')
		res.redirect('/campgrounds');
	});
}