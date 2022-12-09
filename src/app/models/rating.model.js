const mongoose = require("mongoose")
const schema = mongoose.Schema(
	{   
		rate: Number,
		destinationId: mongoose.Schema.Types.ObjectId,
		content: String,
		creator: String,
	},
	{
		timestamps: true
	}
)

module.exports = mongoose.model('rating', schema)