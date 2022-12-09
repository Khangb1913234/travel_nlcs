const express = require("express")
const me = require("../app/controllers/me.controller.js")

module.exports = function(app){
    const router = express.Router()
    router.get("/", me.showHomePage)
    app.use("/", router)
};