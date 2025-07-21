if (process.env.NODE_ENV !== 'production'){
	require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session')
const methodOverride = require('method-override');
const AppError = require('./utils/AppError');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const campgroundsRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const helmet = require('helmet')
const sanitizeV5 = require('./utils/mongoSanitizeV5');
const MongoStore = require('connect-mongo')

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database connected")
})

const app = express();
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('query parser', 'extended')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(sanitizeV5({ replaceWith: '_'}))

const secret = process.env.SECRET 

const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60,
	crypto:{
		secret
	}
})

store.on('error', function (e) {
	console.log("Session Store Error", e)
})

const sessionConfig = {
	store,
	name: 'session',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}
app.use(session(sessionConfig))


app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(flash())

app.use((req, res, next) => {
	res.locals.success = req.flash('success')
	res.locals.error = req.flash('error')
	res.locals.currentUser = req.user;
	next()
})


app.get('/', (req, res) => {
	res.render('home')
});

app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];

app.use(
	helmet.contentSecurityPolicy({
		directives:{
			defaultSrc:[],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc:["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			objectSrc:[],
			imgSrc:[
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/duk8xftrl/",
				"https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
			fontSrc: ["'self'", ...fontSrcUrls],
		}
	})
)

app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)


app.all(/(.*)/, (req, res, next) => {
	next(new AppError('Page not found', 404))
})

app.use((err, req, res, next) => {
	const {status = 500} = err;
	if(!err.message) err.message = "Something went wrong"
	res.status(status).render('error', { err });
})

app.listen(3000, (req, res) => {
	console.log("Serving on port 3000")
})