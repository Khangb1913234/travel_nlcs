const mongoose = require("mongoose")
const type = require("./type.model")
const schema = mongoose.Schema(
	{   
		name: String,
		content: String,
		image: String,
		address: String,
		districtId: mongoose.Schema.Types.ObjectId,
		wardCode: Number,
		operatingTime: String,
		contact: String,
		price: String,
		capacity: String,
		types: [mongoose.Schema.Types.ObjectId],
		services:[mongoose.Schema.Types.ObjectId],
		tourId: [mongoose.Schema.Types.ObjectId],
		creator: String,
	},
	{
		timestamps: true
	}
)

module.exports = mongoose.model('destination', schema)