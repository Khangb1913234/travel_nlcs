const mongoose = require("mongoose")
const Account = require("../models/account.model")
const Destination = require("../models/destination.model")
const Village = require("../models/village.model")
const Approval = require("../models/approval.model")
const jwt = require("jsonwebtoken")


exports.create = function(req, res, next){
    //var creator = req.body.creator
    if(req.body.destinationId)
        var destinationId = req.body.destinationId
    else if(req.body.tourId)
        var tourId = req.body.tourId
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "qtv"){
                    if(req.body.destinationId){
                        Approval.findOne({destinationId: destinationId})
                            .then(function(approval){
                                if(approval){
                                    res.redirect("back")
                                }
                                else{
                                    Approval.create({status: 1, destinationId: destinationId, creator: account.username})
                                        .then(function(){
                                            res.redirect("back")
                                        })
                                        .catch(next)
                                }
                            })
                            .catch(next)

                    }
                    else if(req.body.tourId){
                        Approval.findOne({tourId: tourId})
                            .then(function(approval){
                                if(approval){
                                    res.redirect("back")
                                }
                                else{
                                    Approval.create({status: 1, tourId: tourId, creator: account.username})
                                        .then(function(){
                                            res.redirect("back")
                                        })
                                        .catch(next)
                                }
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

exports.delete = function(req, res, next){
    var id = req.params.id
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "qtv"){
                    
                    Approval.findOneAndDelete({_id: id, creator: account.username})
                        .then(function(){
                            res.redirect("back")
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

exports.actionDelete = function(req, res, next){
    if(req.body.action == "delete"){
        var token = req.cookies.token
        if(token){
            var decode = jwt.verify(token, "krystal")
            Account.findById(decode.id)
                .then(function(account){
                    account = account.toObject()
                    if(account.role == "qtv"){
                        Approval.deleteMany({_id: { $in: req.body.approvals }, creator: account.username})             //Duyệt qua những id có trong destinations
                            .then(function(){
                                res.redirect("back")
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
        res.redirect("back")
    }
}




