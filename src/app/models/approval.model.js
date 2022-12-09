const mongoose = require("mongoose")
const schema = mongoose.Schema(
	{   
        status: Number,
		destinationId: mongoose.Schema.Types.ObjectId,
        tourId: mongoose.Schema.Types.ObjectId,
        creator: String
	},
	{
		timestamps: true
	}
)

module.exports = mongoose.model('approval', schema)