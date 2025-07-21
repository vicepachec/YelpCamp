const mongoose = require('mongoose')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database connected")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async() => {
	await Campground.deleteMany({});
	for (let i = 0; i < 150; i++){
		const random200 = Math.floor(Math.random() * 200);
		const price = Math.floor(Math.random() * 30) + 10;
		const camp = new Campground({
			author: '6879164e28928fd6f8ab7fb0',
			location: `${cities[random200].city}, ${cities[random200].country}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			geometry: {
				type: "Point",
				coordinates: [cities[random200].longitude, cities[random200].latitude]
			},
			images:[
				{
					url: 'https://res.cloudinary.com/duk8xftrl/image/upload/v1753025149/everett-mcintire-BPCsppbNRMI-unsplash_lk5aej.jpg',
					filename: 'YelpCamp/sajdu92djsak2jeald'
				}
			], 
			description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.' +
			'Autem aliquid cum nesciunt ullam mollitia id sunt beatae fugiat inventore ' +
			'quos nobis ducimus ipsam suscipit, delectus, placeat aspernatur. Tempora,' +
			 'ullam? Expedita!',
			price
		})
		await camp.save()
	}
}

seedDB().then(() => {
	mongoose.connection.close()
})