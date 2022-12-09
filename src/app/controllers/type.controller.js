const mongoose = require("mongoose")
const Account = require("../models/account.model")
const Destination = require("../models/destination.model")
const Village = require("../models/village.model")
const Rating = require("../models/rating.model")
const jwt = require("jsonwebtoken")
const Type = require("../models/type.model")

const XLSX = require("xlsx")


exports.create = function(req, res, next){
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "qtv"){
                    var name = req.body.name
                    if(name){
                        Type.create({name: name})
                            .then(function(){
                                res.redirect(`/me/stored/types`)
                            })
                            .catch(next)
                    }
                    else{
                        var path = req.file.path
                        var workbook = XLSX.readFile(path)
                        let worksheet = workbook.Sheets[workbook.SheetNames[0]]
                        var arr = []
                        for(let cell in worksheet){
                            const cellAsString = cell.toString()
                            if(cellAsString[1] !== "r" && cellAsString !== "m" && cellAsString[1] > 1){
                                if(cellAsString[0] == "A"){
                                    const name = worksheet[cell].v
                                    arr.push({name: name})
                                }
                            }
                        }
                        Type.insertMany(arr)
                            .then(function(){
                                res.redirect(`/me/stored/types`)
                            })
                            .catch(next)
                    }
                   
                }
                else{
                    res.redirect("back")
                }
            })
            .catch(next)
    }
}

exports.add = function(req, res, next){
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "qtv"){
                    res.render("types/formadd", {
                        account: account
                    })
                }
                else{
                    res.redirect("back")
                }
            })
            .catch(next)
    }
}

exports.edit = function(req, res, next){
    const id = req.params.id
    Type.findOne({_id: id})
        .then(function(type){
            type = type.toObject()
            var token = req.cookies.token
            if(token){
                var decode = jwt.verify(token, "krystal")
                Account.findById(decode.id)
                    .then(function(account){
                        account = account.toObject()
                        if(account.role == "qtv"){
                            res.render("types/formupdate.hbs", {
                                type: type,
                                account: account
                            })
                        }
                        else{
                            res.redirect("back")
                        } 
                    })
                    .catch(next)
            }
            else{
                res.redirect("back")
            } 
        })
        .catch(next)
}

exports.update = function(req, res, next){
	const id = req.params.id
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "qtv"){
                    Type.findOneAndUpdate({_id: id}, req.body, { new: true} )
                        .then(function(){
                            res.redirect(`/me/stored/types`)
                        })
                        .catch(next)
                }
                else{
                    res.redirect("back")
                }
            })
            .catch(next)
    }
}

exports.delete = function(req, res, next){
    const id = req.params.id;
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "qtv"){
                    Type.findOneAndDelete({_id: id})
                        .then(function(){
                            res.redirect(`/me/stored/types`)
                        })
                        .catch(next)
                }
                else{
                    res.redirect("back")
                }
            })
            .catch(next)
    }
        
}

exports.action = function(req, res, next){
    if(req.body.action == "delete"){
        var token = req.cookies.token
        if(token){
            var decode = jwt.verify(token, "krystal")
            Account.findById(decode.id)
                .then(function(account){
                    account = account.toObject()
                    if(account.role == "qtv"){
                        Type.deleteMany({_id: { $in: req.body.types }})             //Duyệt qua những id có trong destinations
                            .then(function(){
                                res.redirect(`/me/stored/types`)
                            })
                            .catch(next)
                    }
                    else{
                        res.redirect("back")
                    }
                })
                .catch(next)
        }
    }
    else{
        res.redirect("/me/stored/types")
    }
}