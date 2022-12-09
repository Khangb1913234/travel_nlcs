const express = require("express")
const villages = require("../app/controllers/village.controller.js")
const verifyToken = require("../app/middlewares/auth.middleware")

module.exports = function(app){
    const router = express.Router()
    router.get("/", villages.findAll)
    router.get("/:id", villages.findOne)
    router.get(":/districtCode", villages.findDistrict)
    //router.get("*", (_, res) => res.render("notfound"))
    app.use("/villages", router)
};