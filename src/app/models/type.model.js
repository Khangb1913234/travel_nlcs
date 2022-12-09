const mongoose = require("mongoose")
const destination = require("./destination.model")
const schema = mongoose.Schema(
	{   
		name: String,
		destinations: [mongoose.Schema.Types.ObjectId],
	},
	{
		timestamps: true
	}
)

module.exports = mongoose.model('type', schema)