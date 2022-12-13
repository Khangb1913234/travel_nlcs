const express = require("express")
const destinations = require("../app/controllers/destination.controller.js")
const verifyToken = require("../app/middlewares/auth.middleware")
const upload = require("../app/middlewares/upload.middleware")
const multer = require("multer")
const uploadexcel = multer({ dest: './src/public/upload/' })
module.exports = function(app){
    const router = express.Router()
    router.get("/", destinations.findAll)
    router.get("/form/add", verifyToken, destinations.add)           //view
    router.get("/search/:slug", destinations.search)
    router.get("/edit/:id", verifyToken, destinations.edit)          //view
    router.post("/create", upload.array("image[]"), verifyToken, destinations.create)         //server
    router.post("/create/excel", uploadexcel.single("file"), verifyToken, destinations.create)         //server
    router.put("/update/:id", upload.array("image[]"), verifyToken, destinations.update)      //server
    router.delete("/delete/:id", verifyToken, destinations.delete)
    router.post("/action", verifyToken, destinations.action)
    router.get("/filter/:districtID/:wardcode/:typeID/:serviceID", destinations.filter)
    router.get("/:id", destinations.findOne)
    router.get("*", (_, res) => res.render("notfound"))
    app.use("/destinations", router)
};