const express = require("express")
const comments = require("../app/controllers/comment.temp.js")
const verifyToken = require("../app/middlewares/auth.middleware")

module.exports = function(app){
    const router = express.Router()
    router.post("/create", verifyToken, comments.create)
    router.put("/update/:id/:name", comments.update)
    router.delete("/delete/:id/:name/:admin", verifyToken, comments.delete)
    app.use("/comments", router)
};