const mongoose = require("mongoose")

async function connect(){
    mongoose.connect("mongodb://localhost:27017/nlcs")
    .then(function(){
        console.log("Connect to the local database")
    })
    .catch(function(err){
        console.log("Cannot connect to the local database", err)
        process.exit()
    })
}

module.exports = {connect}