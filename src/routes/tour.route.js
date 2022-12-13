const express = require("express")
const tours = require("../app/controllers/tour.controller.js")
const verifyToken = require("../app/middlewares/auth.middleware")
const upload = require("../app/middlewares/upload.middleware")
const multer = require("multer")
const uploadexcel = multer({ dest: './src/public/upload/' })

module.exports = function(app){
    const router = express.Router()
    router.get("/", tours.findAll)
    router.get("/form/add", tours.add)           //view
    router.post("/create", upload.array("image[]"), tours.create)         //server
    router.post("/create/excel", uploadexcel.single("file"), tours.create)         //server
    router.get("/edit/:id", tours.edit)          //view
    router.put("/update/:id",upload.array("image[]"), tours.update)      //server
    router.delete("/delete/:id", tours.delete)
    router.post("/action", tours.action)
    router.get("/:id", tours.findOne)
    router.get("/filter/:destinationID/:priceID", tours.filter)
    router.get("*", (_, res) => res.render("notfound"))
    app.use("/tours", router)
};  