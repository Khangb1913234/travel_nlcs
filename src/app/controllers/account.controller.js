const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const Account = require('../models/account.model')
const bcrypt = require("bcryptjs")
const { edit } = require('./destination.controller')

const defaultRole = "tv"

exports.login = function(req, res, next){
    const username = req.body.username
    const password = req.body.password
    Account.findOne({username: username})
        .then(function(acc){
            const check = bcrypt.compareSync(password, acc.password)
            if(acc && check){
                var token = jwt.sign({id: acc._id}, "krystal", {expiresIn: 3600})
                res.json({
                    token: token
                })
            }
            else{
                res.json({message: "Wrong username or password !!!"})
            }
        })
        .catch(next)
        
}
exports.log = function(req, res, next){
    res.render("accounts/formlogin")
}

exports.private = function(req, res, next){
    var token = req.cookies.token
    var decode = jwt.verify(token, "krystal")
    Account.findById(decode.id)
        .then(function(account){
            account = account.toObject()
            res.render("me/privatehome", {
                account: account
            })
        })
        .catch(next)
        
}


exports.register = function(req, res, next){ 
    const account = new Account(
        {
            email: req.body.email,
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10),
            role: defaultRole
        }
    )
    const name = req.body.username
    const email = req.body.email
    Account.findOne({username: name})
        .then(function(acc){
            if(acc){
                var msg = "This username is already in use"
                res.render("accounts/formregister", {
                    msg: msg
                })
            }
            else{
                Account.findOne({email: email})
                    .then(function(acc){
                        if(acc){
                            var msg = "This email is already in use"
                            res.render("accounts/formregister", {
                                msg: msg
                            })
                        }
                        else{
                            account.save()
                                .then(function(){
                                    var msg = "Registered successfully"
                                    res.render("accounts/formregister", {
                                        msg: msg
                                    })
                                })
                                .catch(next)  
                        }
                    })
                    .catch(next)                 
            }
        })
        .catch(next)
    
}

exports.reg = function(req, res, next){
    res.render("accounts/formregister")
}

exports.edit = function(req, res, next){
    var token = req.cookies.token
    var decode = jwt.verify(token, "krystal")
    var id = req.params.id
    Account.findById(decode.id)
        .then(function(account){
            if(account.role == "qtv"){
                account = account.toObject()
                Account.findOne({_id: id})
                    .then(function(accountE){
                        accountE = accountE.toObject()
                        res.render("accounts/formupdate", {
                            account: account,
                            accountE: accountE
                        }) 
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
    var token = req.cookies.token
    var decode = jwt.verify(token, "krystal")
    var id = req.params.id
    Account.findById(decode.id)
        .then(function(account){
            if(account.role == "qtv"){
                account = account.toObject()
                if(req.body.role == "qtv" || req.body.role == "ctv1" || req.body.role == "ctv2" || req.body.role == "tv"){
                    Account.findOneAndUpdate({_id: id}, req.body, {new: true})
                        .then(function(){
                            res.redirect("back")
                        })
                        .catch(next)
                }
                else{
                    res.redirect("back")
                }
            }
            else{
                res.redirect("back")
            }
            
        })
        .catch(next)
}

exports.delete = function(req, res, next){
    var token = req.cookies.token
    var decode = jwt.verify(token, "krystal")
    var id = req.params.id
    Account.findById(decode.id)
        .then(function(account){
            if(account.role == "qtv"){
                account = account.toObject()
                Account.findOneAndDelete({_id: id})
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


