const express = require("express")
const account = require("../app/controllers/account.controller.js")
const verifyToken = require("../app/middlewares/auth.middleware")

module.exports = function(app){
    const router = express.Router()
    router.get("/login", account.log)                   //view
    router.post("/account/login", account.login)         //server
    router.get("/register", account.reg)                //view
    router.post("/account/register",account.register)    //server
    router.get("/account/edit/:id", verifyToken, account.edit)       //view
    router.put("/account/update/:id", verifyToken, account.update)   //server
    router.delete("/account/delete/:id", verifyToken, account.delete)
    router.get("/private", verifyToken, account.private)
    // router.get("*", (_, res) => res.render("notfound"))
    
    app.use("/", router)
};

