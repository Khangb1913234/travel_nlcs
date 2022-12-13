const path = require("path")
const multer = require("multer")

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./src/public/upload/")
    },
    filename: function(req, file, cb){
        let name = path.extname(file.originalname)
        cb(null, Date.now() + name)
    }
})

var upload = multer ({
    storage: storage,
    fileFilter: function(req, file, callback){
        // if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpge"){
        //     callback(null, true)
        // }
        // else{
        //     console.log("File png jpg")
        //     callback(null, false)
        // }
        callback(null, true)
    }

})

console.log("def")

module.exports = upload