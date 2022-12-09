const mongoose = require("mongoose")
const schema = mongoose.Schema(
	{   
		title: String,
		content: String,
        contact: String,
        image: String,
		price: Number,
		time: String,
        destinations: [mongoose.Schema.Types.ObjectId],
		creator: String
	},
	{
		timestamps: true
	}
)

module.exports = mongoose.model('tour', schema)