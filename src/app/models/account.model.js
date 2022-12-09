const mongoose = require("mongoose")

const schema = mongoose.Schema(
	{   
		email: {
			type: String,
			required: [true, 'Email is required']
		},
		username: {
			type: String,
			required: [true, 'Username is required']
		},
		password: {
			type: String,
			required: [true, 'Password is required']
		},
		role: String
	},
	{
		timestamps: true
	}
)

module.exports = mongoose.model('account', schema)