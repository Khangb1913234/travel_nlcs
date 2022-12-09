const express = require("express")
const rating = require("../app/controllers/rating.controller.js")
const verifyToken = require("../app/middlewares/auth.middleware")

module.exports = function(app){
    const router = express.Router()
    router.post("/create", verifyToken, rating.create)
    // router.put("/update/:id/:name", rating.update)
    // router.delete("/delete/:id/:name/:admin", verifyToken, rating.delete)
    //router.get("*", (_, res) => res.render("notfound"))
    app.use("/rating", router)
};