const express = require("express")
const services = require("../app/controllers/service.controller.js")
const verifyToken = require("../app/middlewares/auth.middleware")

const multer  = require('multer')
const upload = multer({ dest: './src/public/upload/' })

module.exports = function(app){
    const router = express.Router()
    router.get("/form/add", verifyToken, services.add)
    router.post("/create", upload.single("name"), verifyToken, services.create)
    router.get("/edit/:id", verifyToken, services.edit)                                //view
    router.put("/update/:id", verifyToken, services.update)                            //server
    router.delete("/delete/:id", verifyToken, services.delete)
    router.post("/action", verifyToken, services.action)
    // router.get("*", (_, res) => res.render("notfound"))
    app.use("/services", router)
};