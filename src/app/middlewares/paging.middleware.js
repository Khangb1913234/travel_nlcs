module.exports = function(req, res, next){
    res.locals.pageNumber = "1"

    if(req.query.hasOwnProperty("pageNumber")){
        res.locals.pageNumber = req.query.pageNumber
    }

    next()
}