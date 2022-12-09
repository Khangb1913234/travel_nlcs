const mongoose = require('mongoose')
const Destination = require('../models/destination.model')
const Account = require("../models/account.model")
const Tour = require("../models/tour.model")
const Approval = require("../models/approval.model")
const Type = require("../models/type.model")
const Service = require("../models/service.model")
const Rating = require('../models/rating.model')
const jwt = require("jsonwebtoken")


exports.findAllAccount = function(req, res, next){
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                var accountQuery = Account.find({$or: [{role: "tv"}, {role:"ctv1"}, {role: "ctv2"}]})
                if(req.query.hasOwnProperty("_sort")){
                    accountQuery = accountQuery.sort({
                        [req.query.column]: req.query.type
                    })
                }
                if(account.role == "qtv"){
                    accountQuery
                        .skip(0)
                        .limit(0)
                        .then(function(accounts){
                            accounts = accounts.map(function(accounts){
                                return accounts.toObject()
                            })
                            res.render("me/stored_account", {
                                accounts: accounts,
                                account: account
                            })
                        })               
                }
                else{
                    res.redirect("back")
                }
            })
            .catch(next)
    }
}

exports.findAllApproval = function(req, res, next){
    var creator = req.params.username
    var opt = req.params.opt
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "qtv"){
                    if(opt == "destinations"){
                        var approvalDesQuery = Approval.find({creator: account.username, "destinationId": {$exists: true}})
                        if(req.query.hasOwnProperty("_sort")){
                            approvalDesQuery = approvalDesQuery.sort({
                                [req.query.column]: req.query.type
                            })
                        }
                        approvalDesQuery
                            .skip(0)
                            .limit(0)
                            .then(function(approvals){
                                approvals = approvals.map(function(approvals){
                                    return approvals.toObject()
                                })
                                var destinationID = []
                                for(i = 0; i < approvals.length; i++)
                                    destinationID[i] = approvals[i].destinationId
                                Destination.find({_id: {$in: destinationID}})
                                    .then(function(destinations){
                                        destinations = destinations.map(function(destinations){
                                            return destinations.toObject()
                                        })
                                        for(i = 0; i < approvals.length; i++){
                                            for(j = 0; j < destinations.length; j++){
                                                if(approvals[i].destinationId.toString() == destinations[j]._id.toString()){
                                                    var destination = {
                                                        destinationName: destinations[j].name
                                                    }
                                                    approvals[i] = Object.assign(approvals[i], destination)
                                                    break
                                                }
                                            }
                                            
                                        }
                                        res.render("me/stored_approval_des", {
                                            approvals: approvals,
                                            account: account
                                        })
                                    })
                                    .catch(next)
                            })
                            .catch(next)
                    }
                    else if(opt == "tours"){
                        var approvalTourQuery = Approval.find({creator: account.username, "tourId": {$exists: true}})
                        if(req.query.hasOwnProperty("_sort")){
                            approvalTourQuery = approvalTourQuery.sort({
                                [req.query.column]: req.query.type
                            })
                        }
                        approvalTourQuery
                            .skip(0)
                            .limit(0)
                            .then(function(approvals){
                                approvals = approvals.map(function(approvals){
                                    return approvals.toObject()
                                })
                                var tourID = []
                                for(i = 0; i < approvals.length; i++)
                                    tourID[i] = approvals[i].tourId
                                Tour.find({_id: {$in: tourID}})
                                    .then(function(tours){
                                        tours = tours.map(function(tours){
                                            return tours.toObject()
                                        })
                                        for(i = 0; i < approvals.length; i++){
                                            for(j = 0; j < tours.length; j++){
                                                if(approvals[i].tourId.toString() == tours[j]._id.toString()){
                                                    var tour = {
                                                        tourName: tours[j].title
                                                    }
                                                    approvals[i] = Object.assign(approvals[i], tour)
                                                    break
                                                }
                                            }
                                            
                                        }
                                        res.render("me/stored_approval_tour", {
                                            approvals: approvals,
                                            account: account
                                        })
                                    })
                                    .catch(next)
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
}

exports.findAllNotDes = function(req, res, next){
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "qtv"){
                    Approval.find({})
                        .then(function(appr){
                            if(appr.length != 0){     
                                Approval.find({status: 1})
                                    .then(function(approvals){
                                        approvals = approvals.map(function(approvals){
                                            return approvals.toObject()
                                        })
                                        var approved = []
                                        for(var i = 0; i < approvals.length; i++)
                                            approved[i] = approvals[i].destinationId
                                        var notDesQuery = Destination.find({_id: {$nin: approved}})
                                        if(req.query.hasOwnProperty("_sort")){
                                            notDesQuery = notDesQuery.sort({
                                                [req.query.column]: req.query.type
                                            })
                                        }
                                        notDesQuery
                                            .skip(0)
                                            .limit(0)
                                            .then(function(destinations){
                                                destinations = destinations.map(function(destinations){
                                                    return destinations.toObject()
                                                })
                                                res.render("me/stored_notdes",{
                                                    destinations: destinations,
                                                    account: account
                                                })
                                            })
                                            .catch(next)
                                    })
                                    .catch(next)
                            }
                            else{
                                Destination.find({})
                                    .then(function(destinations){
                                        destinations = destinations.map(function(destinations){
                                            return destinations.toObject()
                                        })
                                        res.render("me/stored_notdes",{
                                            destinations: destinations,
                                            account: account
                                        })
                                    })
                                    .catch(next)
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
}

exports.findAllDestination = function(req, res, next){
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                var destinationQuery = Destination.find({creator: account.username})
                if(req.query.hasOwnProperty("_sort")){
                    destinationQuery = destinationQuery.sort({
                        [req.query.column]: req.query.type
                    })
                }
                if(account.role == "ctv1"){
                    destinationQuery
                        .skip(0)
                        .limit(0)
                        .then(function(destinations){
                            destinations = destinations.map(function(destinations){
                                return destinations.toObject()
                            })
                            res.render("me/stored_destinations", {
                                destinations: destinations,
                                account: account
                            })
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

}

exports.findAllNotTour = function(req, res, next){
    var token = req.cookies.token
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "qtv"){
                    Approval.find({})
                        .then(function(appr){
                            if(appr.length != 0){     
                                Approval.find({status: 1})
                                    .then(function(approvals){
                                        approvals = approvals.map(function(approvals){
                                            return approvals.toObject()
                                        })
                                        var approved = []
                                        for(var i = 0; i < approvals.length; i++)
                                            approved[i] = approvals[i].tourId
                                        var notTourQuery = Tour.find({_id: {$nin: approved}})
                                        if(req.query.hasOwnProperty("_sort")){
                                            notTourQuery = notTourQuery.sort({
                                                [req.query.column]: req.query.type
                                            })
                                        }
                                        notTourQuery
                                            .skip(0)
                                            .limit(0)
                                            .then(function(tours){
                                                tours = tours.map(function(tours){
                                                    return tours.toObject()
                                                })
                                                res.render("me/stored_nottour",{
                                                    tours: tours,
                                                    account: account
                                                })
                                            })
                                            .catch(next)
                                    })
                                    .catch(next)
                            }
                            else{
                                Tour.find({})
                                    .then(function(tours){
                                        tours = tours.map(function(tours){
                                            return tours.toObject()
                                        })
                                        res.render("me/stored_nottour",{
                                            tours: tours,
                                            account: account
                                        })
                                    })
                                    .catch(next)
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
}

exports.findAllTour = function(req, res, next){
    var token = req.cookies.token   
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                var tourQuery = Tour.find({creator: account.username})
                if(req.query.hasOwnProperty("_sort")){
                    tourQuery = tourQuery.sort({
                        [req.query.column]: req.query.type
                    })
                }
                if(account.role == "ctv2"){
                    tourQuery
                        .then(function(tours){  
                            tours = tours.map(function(tours){
                                return tours.toObject()
                            })
                            res.render("me/stored_tours", {
                                tours: tours,
                                account: account
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
    else{
        res.redirect("back")
    }
    
}

exports.findAllType = function(req, res, next){
    var token = req.cookies.token   
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                var typeQuery = Type.find({})
                if(req.query.hasOwnProperty("_sort")){
                    typeQuery = typeQuery.sort({
                        [req.query.column]: req.query.type
                    })
                }
                if(account.role == "qtv"){
                    typeQuery
                        .skip(0)
                        .limit(0)
                        .then(function(types){  
                            types = types.map(function(types){
                                return types.toObject()
                            })
                            res.render("me/stored_type", {
                                types: types,
                                account: account
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
    else{
        res.redirect("back")
    }
}

exports.findAllService = function(req, res, next){
    var token = req.cookies.token   
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                var serviceQuery = Service.find({})
                if(req.query.hasOwnProperty("_sort")){
                    serviceQuery = serviceQuery.sort({
                        [req.query.column]: req.query.type
                    })
                }
                account = account.toObject()
                if(account.role == "qtv"){
                    serviceQuery
                        .skip(0)
                        .limit(0)
                        .then(function(services){  
                            services = services.map(function(services){
                                return services.toObject()
                            })
                            res.render("me/stored_service", {
                                services: services,
                                account: account
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
}

exports.showHomePage = function(req, res, next){
    Destination.find({})
        .then(function(destinations){
            destinations = destinations.map(function(destinations){
                return destinations.toObject()
            })
            var b = []
            for(var i = 0; i < destinations.length; i++)
                b[i] = destinations[i]._id
            Rating.find({destinationId: {$in: b}})
                .then(function(rating){
                    rating = rating.map(function(rating){
                        return rating.toObject()
                    })
                    for(var i = 0; i < destinations.length; i++){
                        var point = 0, count = 0
                        for(j = 0; j < rating.length; j++){
                            if(rating[j].destinationId.toString() == destinations[i]._id.toString()){
                                point += rating[j].rate
                                count++
                            }
                        }
                        point = (point / count).toFixed(1)
                        
                        var rate = {
                            point: point,
                            count: count
                        }
                        
                        
                        destinations[i] = Object.assign(destinations[i], rate)
                        
                    }
                    
                    var famousDes = []
                    var j = 0
                    for(var i = 0; i < destinations.length; i++){
                        if((destinations[i].point != "NaN") && (Number(destinations[i].point) >= 3)){
                            famousDes[j] = destinations[i]
                            j++
                        }
                    }
                    var token = req.cookies.token   
                    if(token){
                        var decode = jwt.verify(token, "krystal")
                        Account.findById(decode.id)
                            .then(function(account){
                                account = account.toObject()
                                res.render("home_page", {
                                    famousDes: famousDes,
                                    account: account
                                })
                            })
                            .catch(function(err){
                                console.log(err)
                            })
                    }
                    else{
                        res.render("home_page", {
                            famousDes: famousDes
                        })
                    }
                    
                })
                .catch(function(err){
                    console.log(err)
                })
            
            
        })
        .catch(function(err){
            console.log(err)
        })
}


