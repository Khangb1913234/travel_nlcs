const mongoose = require("mongoose")
const Account = require("../models/account.model")
const Comment = require("../models/comment.model")
const Destination = require("../models/destination.model")
const Village = require("../models/village.model")


exports.create = function(req, res, next){
    const comment = new Comment(
        {
            content: req.body.comment,
            destinationId: req.body.destinationId,
            commentator: req.body.commentator
        }
    )
    comment.save()
        .then(function(){
            res.redirect("back")
        })
        .catch(next)
}

exports.update = function(req, res, next){
    var id = req.params.id
    var name = req.params.name
    Comment.findOneAndUpdate({_id: id, commentator: name}, {content: req.body.content}, {new: true})
        .then(function(){
            res.redirect("back")
        })
        .catch(next) 
}

exports.delete = function(req, res, next){
    var id = req.params.id
    var name = req.params.name
    var admin = req.params.admin
    if(admin != "true"){
        Comment.deleteOne({_id: id, commentator: name})
            .then(function(){
                res.redirect("back")
            })
            .catch(next)
    }
    else{
        Comment.findOne({_id: id})
            .then(function(comment){
                Account.findOne({username: comment.commentator})
                    .then(function(account){
                        if(!account.admin){
                            Comment.deleteOne({_id: id})
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
            })
            .catch(next)
        
    }
    
}
