const jwt = require("jsonwebtoken")

const verifyToken = function(req, res, next){
    // var token = req.header("Authorization")
    // var token = authHeader && authHeader.split(" ")[1]
    var token = req.cookies.token
    console.log(token)
    if(!token){
        return res.redirect("/login")
    }
    try {
        const decode = jwt.verify(token, "krystal")
        if(decode)
            next()
    } 
    catch(err){
        res.redirect("/login")
    }

}

module.exports = verifyToken