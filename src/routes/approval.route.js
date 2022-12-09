const express = require("express")
const approval = require("../app/controllers/approval.controller.js")
const verifyToken = require("../app/middlewares/auth.middleware")

module.exports = function(app){
    const router = express.Router()
    router.post("/create", verifyToken, approval.create)
    router.delete("/delete/:id", verifyToken, approval.delete)
    router.post("/action", verifyToken, approval.actionDelete)
    // router.get("*", (_, res) => res.render("notfound"))
    app.use("/approvals", router)
};