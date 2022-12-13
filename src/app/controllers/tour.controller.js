const mongoose = require('mongoose')
const Destination = require('../models/destination.model')
const Village = require("../models/village.model")
const Account = require("../models/account.model")
const Tour = require("../models/tour.model")
const Approval = require("../models/approval.model")
const Type = require("../models/type.model")
const Service = require("../models/service.model")
const jwt = require("jsonwebtoken")
const PAGE_SIZE = 6
const XLSX = require("xlsx")

exports.create = function(req, res, next){
    var title, content, price, time, contact, image
    if(req.body.title)
        title = req.body.title
    if(req.body.content)
        content = req.body.content
    if(req.body.price){
        price = req.body.price
        price = price.replace(".", "").trim()
        price = Number(price)
    }
    if(req.body.time)
        time = req.body.time
    if(req.body.contact)
        contact = req.body.contact
    if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
            s = files.path
            s = s.slice(10)
            path = path + s + ','
            path = path.replace(/\\/g, "/")
        })
        path = path.substring(0, path.lastIndexOf(","))
        image = path
    }
    var token = req.cookies.token
    if(req.body.destinations)
        for(i = 0; i < req.body.destinations.length; i++)
            req.body.destinations[i] = mongoose.Types.ObjectId(req.body.destinations[i])   
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "ctv2"){
                    if(req.body.excel == "yes"){
                        var path = req.file.path
                        var workbook = XLSX.readFile(path)
                        let worksheet = workbook.Sheets[workbook.SheetNames[0]]
                        var titleCol = []
                        var contentCol = []
                        var timeCol = []
                        var priceCol = []
                        var contactCol = []
                        for(let cell in worksheet){
                            const cellAsString = cell.toString()
                            if(cellAsString[1] !== "r" && cellAsString !== "m" && cellAsString[1] > 1){
                                if(cellAsString[0] == "A"){
                                    const title = worksheet[cell].v
                                    titleCol.push({title: title})
                                }
                                else if(cellAsString[0] == "B"){
                                    const content = worksheet[cell].v
                                    contentCol.push({content: content})
                                }
                                else if(cellAsString[0] == "C"){
                                    const time = worksheet[cell].v
                                    timeCol.push({time: time})
                                }
                                else if(cellAsString[0] == "D"){
                                    const price = worksheet[cell].v
                                    priceCol.push({price: price})
                                }
                                else if(cellAsString[0] == "E"){
                                    const contact = worksheet[cell].v.toString()
                                    contactCol.push({contact: contact})
                                }
                            }
                        }
                        for(var i = 0; i < titleCol.length; i++){
                            titleCol[i] = Object.assign(titleCol[i], contentCol[i])
                            titleCol[i] = Object.assign(titleCol[i], timeCol[i])
                            titleCol[i] = Object.assign(titleCol[i], priceCol[i])
                            titleCol[i] = Object.assign(titleCol[i], contactCol[i])
                            titleCol[i] = Object.assign(titleCol[i], {creator: account.username})
                        }
                        Tour.insertMany(titleCol)
                            .then(function(){
                                res.redirect(`/me/stored/tours/${account.username}`)
                            })
                            .catch(next)
                    }
                    else{
                        Tour.create({title: title, content: content, price: price, time: time, contact: contact, image: image, creator: account.username, destinations: req.body.destinations})
                            .then(function(tour){
                                if(req.body.destinations){
                                    for(var i = 0; i < req.body.destinations.length; i++){
                                        Destination.findOneAndUpdate({_id: req.body.destinations[i]}, {$push: {tourId: tour._id}}, {new: true})
                                            .then(function(){
                                                next()
                                            })
                                            .catch(function(err){
                                                console.log(err)
                                            })
                                    }
                                }
                                res.redirect(`/me/stored/tours/${account.username}`)
                            })
                            .catch(function(err){
                                console.log(err)
                            })
                    }
                }
                else{
                    res.redirect("back")
                }
            })
            .catch(function(err){
                console.log(err)
            })
    }
}

exports.findAll = function(req, res, next){
    var refF = "/tours?pageNumber"
    var a = []
    var page = req.query.pageNumber
    page = parseInt(page)
    if(page < 1)
        page = 1
    var skip = (page - 1) * PAGE_SIZE
    Approval.find({status: 1})
        .then(function(approvals){
            for(i = 0; i < approvals.length; i++)
                a[i] = approvals[i].tourId
            if(req.query.hasOwnProperty("pageNumber")){
                Tour.find({_id: {$in: a}})
                    .skip(skip)
                    .limit(PAGE_SIZE)
                    .then(function(tours){
                        Tour.countDocuments({})
                            .then(function(total){
                                var totalPage = Math.ceil(total / PAGE_SIZE)
                                tours = tours.map(function(tours){
                                    return tours.toObject()
                                })
                                Destination.find({})
                                    .then(function(destinations){
                                        destinations = destinations.map(function(destinations){
                                            return destinations.toObject()
                                        })
                                        Type.find({})
                                            .then(function(types){
                                                types = types.map(function(types){
                                                    return types.toObject()
                                                })
                                                Service.find({})
                                                    .then(function(services){
                                                        services = services.map(function(services){
                                                            return services.toObject()
                                                        })
                                                        var token = req.cookies.token
                                                        if(token){
                                                            var decode = jwt.verify(token, "krystal")
                                                            Account.findById(decode.id)
                                                                .then(function(account){
                                                                    account = account.toObject()
                                                                    res.render("tours", {
                                                                        tours: tours,
                                                                        totalItem: total,
                                                                        total: totalPage,
                                                                        account: account,
                                                                        types: types,
                                                                        services: services,
                                                                        destinations: destinations,
                                                                        refF: refF
                                                                    })
                                                                })
                                                                .catch(function(err){
                                                                    console.log(err)
                                                                })
                                                        }
                                                        else{
                                                            res.render("tours", {
                                                                tours: tours,
                                                                totalItem: total,
                                                                total: totalPage,
                                                                types: types,
                                                                services: services,
                                                                destinations: destinations,
                                                                refF: refF
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
                                    })
                                    .catch(function(err){
                                        console.log(err)
                                    })
                                
                            })
                            .catch(function(err){
                                console.log(err)
                            })
                        
                    })
                    .catch(function(err){
                        console.log(err)
                    })
            }
            else{
                Tour.find({_id: {$in: a}})
                .skip(0)
                .limit(PAGE_SIZE)
                .then(function(tours){
                    Tour.countDocuments({})
                        .then(function(total){
                            var totalPage = Math.ceil(total / PAGE_SIZE)
                            tours = tours.map(function(tours){
                                return tours.toObject()
                            })
                            Destination.find({})
                                .then(function(destinations){
                                    destinations = destinations.map(function(destinations){
                                        return destinations.toObject()
                                    })
                                    Type.find({})
                                        .then(function(types){
                                            types = types.map(function(types){
                                                return types.toObject()
                                            })
                                            Service.find({})
                                                .then(function(services){
                                                    services = services.map(function(services){
                                                        return services.toObject()
                                                    })
                                                    var token = req.cookies.token
                                                    if(token){
                                                        var decode = jwt.verify(token, "krystal")
                                                        Account.findById(decode.id)
                                                            .then(function(account){
                                                                account = account.toObject()
                                                                res.render("tours", {
                                                                    tours: tours,
                                                                    totalItem: total,
                                                                    total: totalPage,
                                                                    account: account,
                                                                    types: types,
                                                                    services: services,
                                                                    destinations: destinations,
                                                                    refF: refF
                                                                })
                                                            })
                                                            .catch(function(err){
                                                                console.log(err)
                                                            })
                                                    }
                                                    else{
                                                        res.render("tours", {
                                                            tours: tours,
                                                            totalItem: total,
                                                            total: totalPage,
                                                            types: types,
                                                            services: services,
                                                            destinations: destinations,
                                                            refF: refF
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
                                })
                                .catch(function(err){
                                    console.log(err)
                                })
                        })
                        .catch(function(err){
                            console.log(err)
                        })
                        
                })
                .catch(function(err){
                    console.log(err)
                })
            }
        })
        .catch(function(err){
            console.log(err)
        })
}

exports.findOne = function(req, res, next){
    const {id} = req.params
    var random = Math.floor(Math.random() * 2);
    Approval.find({status: 1})
        .then(function(approvals){
            Tour.findOne({_id: id})
                .then(function(tour){
                    tour = tour.toObject()
                    var a = []
                    var j = 0
                    for(var i = 0 ; i < approvals.length; i++)
                        if(approvals[i].tourId)
                            a[j++] = approvals[i].tourId
                    Tour.find({$or: [{destinations: {$in: tour.destinations}}], _id: {$ne: tour._id, $in: a}})
                        .skip(random)
                        .limit(5)
                        .then(function(tourSimilar){
                            tourSimilar = tourSimilar.map(function(tourSimilar){
                                return tourSimilar.toObject()
                            })
                            var check = 0
                            for(i = 0; i < approvals.length; i++)
                                if(approvals[i].tourId)
                                    if(tour._id.toString() == approvals[i].tourId.toString()){
                                        check = 1
                                        break
                                    }
                            if(check == 1){
                                Destination.find({_id: {$in: tour.destinations}})
                                    .then(function(destinations){
                                        destinations = destinations.map(function(destinations){
                                            return destinations.toObject()
                                        })
                                        var token = req.cookies.token
                                        if(token){
                                            var decode = jwt.verify(token, "krystal")
                                            Account.findById(decode.id)
                                                .then(function(account){
                                                    account = account.toObject()
                                                    res.render("tour/tour", {
                                                        tour: tour,
                                                        destinations: destinations,
                                                        account: account,
                                                        tourSimilar: tourSimilar                                              
                                                    })
                                                    // res.json(rate)
                                        
                                                })
                                                .catch(function(err){
                                                    console.log(err)
                                                })
                                        }
                                        else{
                                            res.render("tour/tour", {
                                                tour: tour,
                                                destinations: destinations,
                                                tourSimilar: tourSimilar
                                            })
                                            // res.json(rate)
                                        }
                                    })
                                    .catch(function(err){
                                        console.log(err)
                                    })
                            }
                            else{
                                res.redirect("back")            //reder notfound page
                            }
                        })
                        .catch(function(err){
                            console.log(err)
                        })     
                })
                .catch(function(err){
                    console.log(err)
                })
            })
        .catch(function(err){
            console.log(err)
        })
}

exports.add = function(req, res, next){
    var token = req.cookies.token
    var a = []
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                Approval.find({status: 1})
                    .then(function(approvals){
                        for(var i = 0; i < approvals.length; i++)
                            a[i] = approvals[i].destinationId
                        Destination.find({_id: {$in: a}})
                            .then(function(destinations){
                                destinations = destinations.map(function(destinations){
                                    return destinations.toObject()
                                })
                                if(account.role == "ctv2")
                                    res.render("tour/formadd", {
                                        account: account,
                                        destinations: destinations
                                    })
                                else
                                    res.redirect("back")
                            })
                            .catch(next)
                    })
                    .catch(next)
                
            })
            .catch(next)
    }
}

exports.edit = function(req, res, next){
    var a = []
    const id = req.params.id
    Approval.find({status: 1})
        .then(function(approvals){
            for(i = 0; i < approvals.length; i++)
                a[i] = approvals[i].destinationId
            Destination.find({_id: {$in: a}})
                .then(function(destinations){
                    destinations = destinations.map(function(destinations){
                        return destinations.toObject()
                    })
                    Tour.findOne({_id: id})
                        .then(function(tour){
                            tour = tour.toObject()
                            var token = req.cookies.token
                            if(token){
                                var decode = jwt.verify(token, "krystal")
                                Account.findById(decode.id)
                                    .then(function(account){
                                        account = account.toObject()
                                        if(account.role == "ctv2"){
                                            res.render("tour/formupdate.hbs", {
                                                tour: tour,
                                                destinations: destinations,
                                                account: account
                                            })
                                        }
                                        else{
                                            res.redirect("back")
                                        } 
                                    })
                                    .catch(function(err){
                                        console.log(err)
                                    })
                            }
                            else{
                                res.redirect("back")
                            } 
                        })
                        .catch(function(err){
                            console.log(err)
                        })

                })
                .catch(function(err){
                    console.log(err)
                })
        })
        .catch(function(err){
            console.log(err)
        })
}

exports.update = function(req, res, next){
	const id = req.params.id
    var token = req.cookies.token
    var title, content, price, time, contact, image
    if(req.body.title)
        title = req.body.title
    if(req.body.content)
        content = req.body.content
    if(req.body.price){
        price = req.body.price
        price = price.replace(".", "").trim()
        price = Number(price)
    }
    if(req.body.time)
        time = req.body.time
    if(req.body.contact)
        contact = req.body.contact
    if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
            s = files.path
            s = s.slice(10)
            path = path + s + ','
            path = path.replace(/\\/g, "/")
        })
        path = path.substring(0, path.lastIndexOf(","))
        image = path
    }
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "ctv2"){
                    var updateQuery
                    if(req.files.length != 0)
                        updateQuery = Tour.findOneAndUpdate({_id: id}, {title: title, content: content, price: price, time: time, contact: contact, image: image, creator: account.username, destinations: req.body.destinations}, { new: true} )
                    else
                        updateQuery = Tour.findOneAndUpdate({_id: id}, {title: title, content: content, price: price, time: time, contact: contact, creator: account.username, destinations: req.body.destinations})
                    updateQuery
                        .then(function(){
                            next()
                        })
                        .catch(function(err){
                            console.log(err)
                        })
                    Tour.findOne({_id: id})
                        .then(function(tour){
                            if(req.body.destinations){
                                for(var i = 0; i < req.body.destinations.length; i++){
                                    console.log(req.body.destinations[i])
                                    Destination.findOneAndUpdate({_id: req.body.destinations[i], tourId: {$ne: tour._id}}, {$push: {tourId: tour._id}}, {new: true})
                                        .then(function(){
                                            next()
                                        })
                                        .catch(function(err){
                                            console.log(err)
                                        })
                                    
                                }
                            }
                            Destination.find({_id: {$nin: req.body.destinations}})
                                .then(function(destinations){
                                    for(var i = 0; i < destinations.length; i++){
                                        Destination.findOneAndUpdate({_id: destinations[i]._id}, {$pull: {tourId: tour._id}}, {new: true})
                                            .then(function(){
                                                next()
                                            })
                                            .catch(function(err){
                                                console.log(err)
                                            })
                                    }
                                })
                                .catch(function(err){
                                    console.log(err)
                                })
                            res.redirect(`/me/stored/tours/${account.username}`)
                        })
                        .catch(function(err){
                            console.log(err)
                        })
                }
                else{
                    res.redirect("back")
                }
            })
            .catch(function(err){
                console.log(err)
            })
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
                if(account.role == "ctv2"){
                    Tour.findOneAndDelete({_id: id, creator: account.username})
                        .then(function(tour){
                            Destination.updateMany({tourId: tour._id}, {$pull: {tourId: tour._id}},{new: true})
                                .then(function(){
                                    res.redirect(`/me/stored/tours/${account.username}`)
                                })
                                .catch(next)
                        })
                        .catch(next)
                    
                }
            })
            .catch(function(err){
                console.log(err)
            })
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
                    if(account.role == "ctv2"){
                        Tour.deleteMany({_id: { $in: req.body.tours }})             //Duyệt qua những id có trong destinations
                            .then(function(){
                                Destination.updateMany({tourId: {$in: req.body.tours}}, {$pull: {tourId: {$in: req.body.tours}}}, {new: true})
                                    .then(function(){
                                        res.redirect(`/me/stored/tours/${account.username}`)
                                    })
                                    .catch(function(err){
                                        console.log(err)
                                    })
                            })
                            .catch(function(err){
                                console.log(err)
                            })
                    }
                    else{
                        res.redirect("back")
                    }
                })
                .catch(function(err){
                    console.log(err)
                })
        }
    }
    else{
        res.redirect("back")
    }
}

exports.filter = function(req, res, next){
    var destinationID = req.params.destinationID
    var priceID = req.params.priceID
    if(destinationID.length > 1)
        destinationID = destinationID.split("&")
    else
        destinationID = destinationID.split("")
    if(priceID.length > 1)
        priceID = priceID.split("&")
    else
        priceID = priceID.split("")
    var condition
    if(priceID == "0"){
        condition = {
            destinations: {$in: destinationID}
        }
    }
    else if(destinationID == "0"){
        if(priceID.length == 1){
            if(priceID[0] == 1){
                condition = {
                    price: {$lt: 500000}
                }
            }
            else if(priceID[0] == 2){
                condition = {
                    price: {$gte: 500000, $lte: 1000000}
                }
            }
            else if(priceID[0] == 3){
                condition = {
                    price: {$gt: 1000000}
                }
            }
        }
        else if(priceID.length == 2){
            if(priceID[0] == 1){
                if(priceID[1] == 2){
                    condition = {
                        price: {$lte: 1000000}
                    }
                }
                else{
                    condition = {
                        $or: [{price: {$lt: 500000}}, {price: {$gt: 1000000}}]
                    }
                }
            }
            else if(priceID[0] == 2){
                condition = {
                    price: {$gte: 500000}
                }
            }
        }
        else{
            condition = {}
        }
    }
    else{
        if(priceID.length == 1){
            if(priceID[0] == 1){
                condition = {
                    destinations: {$in: destinationID},
                    price: {$lt: 500000}
                }
            }
            else if(priceID[0] == 2){
                condition = {
                    destinations: {$in: destinationID},
                    price: {$gte: 500000, $lte: 1000000}
                }
            }
            else if(priceID[0] == 3){
                condition = {
                    destinations: {$in: destinationID},
                    price: {$gt: 1000000}
                }
            }
        }
        else if(priceID.length == 2){
            if(priceID[0] == 1){
                if(priceID[1] == 2){
                    condition = {
                        destinations: {$in: destinationID},
                        price: {$lte: 1000000}
                    }
                }
                else{
                    condition = {
                        destinations: {$in: destinationID},
                        $or: [{price: {$lt: 500000}}, {price: {$gt: 1000000}}]
                    }
                }
            }
            else if(priceID[0] == 2){
                condition = {
                    destinations: {$in: destinationID},
                    price: {$gte: 500000}
                }
            }
        }
        else{
            condition = {
                destinations: {$in: destinationID}
            }
        }
    }
    Approval.find({status: 1})
        .then(function(approvals){
            approvals = approvals.map(function(approvals){
                return approvals.toObject()
            })
            Tour.find(condition)
                .then(function(tours){
                    tours = tours.map(function(tours){
                        return tours.toObject()
                    }) 
                    for(var i = 0; i < tours.length; i++){
                        var check = 0
                        for(var j = 0; j < approvals.length; j++){
                            if(approvals[j].tourId){
                                if(tours[i]._id.toString() == approvals[j].tourId.toString()){
                                    check = 1
                                    break
                                }
                            }
                        }
                        if(check == 0)
                            tours.splice(i, 1)
                    }
                    Destination.find({})
                        .then(function(destinations){
                            destinations = destinations.map(function(destinations){
                                return destinations.toObject()
                            })
                            var token = req.cookies.token
                            if(token){
                                var decode = jwt.verify(token, "krystal")
                                Account.findById(decode.id)
                                    .then(function(account){
                                        account = account.toObject()
                                        res.render("tours", {
                                            tours: tours,
                                            account: account,
                                            destinations: destinations
                                        })
                                    })
                                    .catch(function(err){
                                        console.log(err)
                                    })
                            }
                            else{
                                res.render("tours", {
                                    tours: tours,
                                    destinations: destinations,
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
        })
        .catch(function(err){
            console.log(err)
        })
}


