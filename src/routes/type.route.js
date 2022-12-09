const express = require("express")
const types = require("../app/controllers/type.controller.js")
const verifyToken = require("../app/middlewares/auth.middleware")

const multer  = require('multer')
const upload = multer({ dest: './src/public/upload/' })

module.exports = function(app){
    const router = express.Router()
    router.get("/form/add", types.add)
    router.post("/create", upload.single("name"), verifyToken, types.create)
    router.get("/edit/:id", verifyToken, types.edit)                                //view
    router.put("/update/:id", verifyToken, types.update)                            //server
    router.delete("/delete/:id", verifyToken, types.delete)
    router.post("/action", verifyToken, types.action)
    // router.get("*", (_, res) => res.render("notfound"))
    app.use("/types", router)
};