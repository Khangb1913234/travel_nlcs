const mongoose = require("mongoose")
const schema = mongoose.Schema(
	{   
		name: {
			type: String,
			// required: [true, 'Name is required']
		},
		code: Number,
		codename: String,
		division_type: String,
		short_codename: String,
		wards: Array

	},
	{
		timestamps: true
	}
)

module.exports = mongoose.model('village', schema)