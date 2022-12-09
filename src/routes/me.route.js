const express = require("express")
const me = require("../app/controllers/me.controller.js")
const verifyToken = require("../app/middlewares/auth.middleware")

module.exports = function(app){
    const router = express.Router()
    router.get("/stored/accounts", verifyToken, me.findAllAccount)
    router.get("/stored/approvals/:opt/:username", verifyToken, me.findAllApproval)
    router.get("/stored/notdestinations", verifyToken, me.findAllNotDes)
    router.get("/stored/nottours", verifyToken, me.findAllNotTour)
    router.get("/stored/destinations/:username", verifyToken, me.findAllDestination)
    router.get("/stored/tours/:username", verifyToken, me.findAllTour)
    router.get("/stored/types", verifyToken, me.findAllType)
    router.get("/stored/services", verifyToken, me.findAllService)
    // router.get("*", (_, res) => res.render("notfound"))
    app.use("/me", router)
};