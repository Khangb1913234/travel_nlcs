const mongoose = require('mongoose')
const Destination = require('../models/destination.model')
const Tour = require("../models/tour.model")
const Village = require("../models/village.model")
const Account = require("../models/account.model")
const Rating = require("../models/rating.model")
const Approval = require("../models/approval.model")
const Type = require("../models/type.model")
const Service = require("../models/service.model")
const jwt = require("jsonwebtoken")
const PAGE_SIZE = 6

// exports.create = function(req, res, next){
//     // var district = req.body.district
//     // var ward = Number(req.body.ward)
//     // var name = req.body.name
//     const destination = new Destination(
//         {
//             name: req.body.name,
//             content: req.body.content,
//             image: req.body.image,
//             districtId: req.body.district,
//             wardCode: req.body.ward
//         }
//     )
//     destination.save()                          
//         .then(function(){
//             // Destination.findOne({name: name})                Thêm vào wards của village một mảng destination
//             //     .then(function(destination){
//             //         Village.findOneAndUpdate({_id: district, 'wards.code': ward}, {$push: { 'wards.$.destination': destination._id } })
//             //             .then(function(village){
//             //                 console.log(destination._id)
//             //                 res.redirect("/destinations")
//             //             })
//             //             .catch(next)    
//             //     })
//             //     .catch(next)
//             res.redirect("/destinations")    
//         })
//         .catch(next)

exports.create = function(req, res, next){
    var name = req.body.name
    var content = req.body.content
    var address = req.body.address
    var time = req.body.operatingTime
    var price = req.body.price
    var capacity = req.body.capacity
    var contact = req.body.contact
    var image = req.body.image
    var districtId = req.body.district
    var wardCode = req.body.ward
    var token = req.cookies.token
    var i = 0
    if(req.body.types)
        for(i = 0; i < req.body.types.length; i++)
            req.body.types[i] = mongoose.Types.ObjectId(req.body.types[i])
    if(req.body.services)
        for(i = 0; i < req.body.services.length; i++)
            req.body.services[i] = mongoose.Types.ObjectId(req.body.services[i])
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "ctv1"){
                    Destination.create({name: name, content: content, address: address, operatingTime: time, price: price, capacity: capacity, contact: contact, image: image, districtId: districtId, wardCode: wardCode, creator: account.username, types: req.body.types, services: req.body.services})
                        .then(function(destination){
                            if(req.body.types){
                                for(i = 0; i < req.body.types.length; i++){
                                    Type.findOneAndUpdate({_id: req.body.types[i]}, {$push: {destinations: destination._id}}, {new: true})
                                        .then(function(){
                                            next()
                                        })
                                        .catch(function(err){
                                            console.log(err)
                                        })
                                }
                            }
                            if(req.body.services){              
                                for(i = 0; i < req.body.services.length; i++){                                   
                                    Service.findOneAndUpdate({_id: req.body.services[i]}, {$push: {destinations: destination._id}}, {new: true})
                                        .then(function(){
                                            next()
                                        })
                                        .catch(function(err){
                                            console.log(err)
                                        })
                                }
                            }
                            res.redirect(`/me/stored/destinations/${account.username}`)
                            //res.json(destination)
                        })
                        .catch(next)
                }
                else{
                    res.redirect("back")
                }
            })
            .catch(next)
    }
    
                                        //Fake data
    // for(var i=0;i<10;i++){
    //     Destination.create({
    //         name: "Fake data" + i,
    //         content: "TTT",
    //         image: "https://images.newscientist.com/wp-content/uploads/2017/06/21180000/planet-10-orange-blue-final-small.jpg?crop=1:1,smart&width=1200&height=1200&upscale=true",
    //         districtId: "62fddc34e94dc7ca84b28f29",
    //         wardCode: 31118
    //     })
    // }

}
    
    

exports.findAll = function(req, res, next){
    var refF = "/destinations?pageNumber"
    var a = []
    var page = req.query.pageNumber
    page = parseInt(page)
    if(page < 1)
        page = 1
    var skip = (page - 1) * PAGE_SIZE
    Approval.find({status: 1})
        .then(function(approvals){
            for(i = 0; i < approvals.length; i++)
                a[i] = approvals[i].destinationId
            if(req.query.hasOwnProperty("pageNumber")){
                Destination.find({_id: {$in: a}})
                    .skip(skip)
                    .limit(PAGE_SIZE)
                    .then(function(destinations){
                        Destination.countDocuments({})
                            .then(function(total){
                                var totalPage = Math.ceil(total / PAGE_SIZE)
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
                                                                    res.render("home", {
                                                                        destinations: destinations,
                                                                        totalItem: total,
                                                                        total: totalPage,
                                                                        account: account,
                                                                        types: types,
                                                                        services: services,
                                                                        refF: refF
                                                                    })
                                                                })
                                                                .catch(function(err){
                                                                    console.log(err)
                                                                })
                                                        }
                                                        else{
                                                            res.render("home", {
                                                                destinations: destinations,
                                                                totalItem: total,
                                                                total: totalPage,
                                                                types: types,
                                                                services: services,
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
                Destination.find({_id: {$in: a}})
                .skip(0)
                .limit(PAGE_SIZE)
                .then(function(destinations){
                    Destination.countDocuments({})
                        .then(function(total){
                            var totalPage = Math.ceil(total / PAGE_SIZE)
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
                                                                res.render("home", {
                                                                    destinations: destinations,
                                                                    totalItem: total,
                                                                    total: totalPage,
                                                                    account: account,
                                                                    types: types,
                                                                    services: services,
                                                                    refF: refF
                                                                })
                                                            })
                                                            .catch(next)
                                                    }
                                                    else{
                                                        res.render("home", {
                                                            destinations: destinations,
                                                            totalItem: total,
                                                            total: totalPage,
                                                            types: types,
                                                            services: services,
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
    var a = []
    const {id} = req.params
    var random = Math.floor(Math.random() * 4);
    Destination.findOne({_id: id})
        .then(function(destinations){
            destinations = destinations.toObject()
            Approval.find({status: 1})
                .then(function(approvals){
                    approvals = approvals.map(function(approvals){
                        return approvals.toObject()
                    })
                    var j = 0
                    for(i = 0; i < approvals.length; i++)
                        if(approvals[i].destinationId)
                            a[j++] = approvals[i].destinationId
                    Destination.find({$or: [{types: {$in: destinations.types}}], _id: {$ne: destinations._id, $in: a}})
                        .skip(random)
                        .limit(5)
                        .then(function(destinationSimilar){
                            destinationSimilar = destinationSimilar.map(function(destinationSimilar){
                                return destinationSimilar.toObject()
                            })
                            var check = 0
                            for(i = 0; i < approvals.length; i++)
                                if(approvals[i].destinationId)
                                    if(destinations._id.toString() == approvals[i].destinationId.toString()){
                                        check = 1
                                        break
                                    }
                            if(check == 1){
                                Rating.find({destinationId: destinations._id})
                                    .sort({'createdAt': 'desc'})
                                    .then(function(rating){
                                        rating = rating.map(function(rating){
                                            return rating.toObject()
                                        })               
                                        var point = 0, count = 0
                                        for(var i of rating){
                                            point += i.rate
                                            count++
                                        }
                                        
                                        point = (point / count).toFixed(1)
                                        var rate = {
                                            point: point,
                                            count: count
                                        }
                                        Type.find({_id: {$in: destinations.types}})
                                            .then(function(types){
                                                types = types.map(function(types){
                                                    return types.toObject()
                                                })
                                                Service.find({_id: {$in: destinations.services}})
                                                    .then(function(services){
                                                        services = services.map(function(services){
                                                            return services. toObject()
                                                        })
                                                        Tour.find({_id: {$in: destinations.tourId}})
                                                            .then(function(tours){
                                                                tours = tours.map(function(tours){
                                                                    return tours.toObject()
                                                                })
                                                                var token = req.cookies.token
                                                                if(token){
                                                                    var decode = jwt.verify(token, "krystal")
                                                                    Account.findById(decode.id)
                                                                        .then(function(account){
                                                                            account = account.toObject()
                                                                            res.render("destinations/destination", {
                                                                                destinations: destinations,
                                                                                account: account,
                                                                                rating: rating,
                                                                                rate: rate,
                                                                                types: types,
                                                                                services: services,
                                                                                tours: tours,
                                                                                destinationSimilar: destinationSimilar
                                                                            })
                                                                            // res.json(rate)
                                                                
                                                                        })
                                                                        .catch(function(err){
                                                                            console.log(err)
                                                                        })
                                                                }
                                                                else{
                                                                    res.render("destinations/destination", {
                                                                        destinations: destinations,
                                                                        rating: rating,
                                                                        rate: rate,
                                                                        types: types,
                                                                        services: services,
                                                                        tours: tours,
                                                                        destinationSimilar: destinationSimilar
                                                                    })
                                                                    // res.json(rate)
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

exports.search = function(req, res, next){
    const keyword = req.params.slug
    var key = keyword[0]
    if(keyword.length > 1)
        key = key + keyword[1]
    Approval.find({status: 1})
        .then(function(approvals){
            Tour.find({title: {$regex: key, $options: "i"}})
                .then(function(tours){
                    tours = tours.map(function(tours){
                        return tours.toObject()
                    })
                    Destination.find({ name: { $regex: key, $options: "i" }})       //Tìm kiếm với những kí tự nào, không phân biệt hoa thường
                        .then(function(destinations){           
                            destinations = destinations.map(function(destinations){
                                return destinations.toObject()
                            })
                            for(var i = 0; i < destinations.length; i++){
                                var check = 0
                                for(var j = 0; j < approvals.length; j++){
                                    if(approvals[j].destinationId)
                                        if(destinations[i]._id.toString() == approvals[j].destinationId.toString()){
                                            check = 1
                                            break
                                        }
                                }
                                if(check == 0)
                                    destinations.splice(i, 1)
                            }
                            for(var i = 0; i < tours.length; i++){
                                var check = 0
                                for(var j = 0; j < approvals.length; j++){
                                    if(approvals[j].tourId)
                                        if(tours[i]._id.toString() == approvals[j].tourId.toString()){
                                            check = 1
                                            break
                                        }
                                }
                                if(check == 0)
                                    tours.splice(i, 1)
                            }
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
                                                                res.render("home", {
                                                                    destinations: destinations,
                                                                    tours: tours,
                                                                    account: account,
                                                                    types: types,
                                                                    services: services
                                                                })
                                                            })
                                                            .catch(function(err){
                                                                console.log(err)
                                                            })
                                                    }
                                                    else{
                                                        res.render("home", {
                                                            destinations: destinations,
                                                            tours: tours,
                                                            types: types,
                                                            services: services
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
        })
        .catch(function(err){
            console.log(err)
        })
    
}

exports.add = function(req, res, next){
    Village.find({})
        .then(function(villages){
            villages = villages.map(function(villages){
                return villages.toObject()
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
                                        if(account.role == "ctv1"){
                                            res.render("destinations/formadd",{
                                                villages: villages,
                                                types: types,
                                                services: services,
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

exports.edit = function(req, res, next){
    const id = req.params.id
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
                    Destination.findOne({_id: id})
                        .then(function(destination){
                            destination = destination.toObject()
                            var token = req.cookies.token
                            if(token){
                                var decode = jwt.verify(token, "krystal")
                                Account.findById(decode.id)
                                    .then(function(account){
                                        account = account.toObject()
                                        if(account.role == "ctv1"){
                                            res.render("destinations/formupdate.hbs", {
                                                destination: destination,
                                                types: types,
                                                services: services,
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
    if(token){
        var decode = jwt.verify(token, "krystal")
        Account.findById(decode.id)
            .then(function(account){
                account = account.toObject()
                if(account.role == "ctv1"){
                    Destination.findOneAndUpdate({_id: id}, req.body, { new: true} )
                        .then(function(){
                            next()
                        })
                        .catch(function(err){
                            console.log(err)
                        })
                    Destination.findOne({_id: id})
                        .then(function(destination){
                            if(req.body.types){
                                for(var i = 0; i < req.body.types.length; i++){
                                    Type.findOneAndUpdate({_id: req.body.types[i], destinations: {$ne: destination._id}}, {$push: {destinations: destination._id}}, {new: true})
                                        .then(function(){
                                            next()
                                        })
                                        .catch(function(err){
                                            console.log(err)
                                        })
                                    
                                }
                            }
                            Type.find({_id: {$nin: req.body.types}})
                                .then(function(types){
                                    for(var i = 0; i < types.length; i++){
                                        Type.findOneAndUpdate({_id: types[i]._id}, {$pull: {destinations: destination._id}}, {new: true})
                                            .then(function(){
                                                next()
                                            })
                                            .catch(function(err){
                                                console.log(err)
                                            })
                                    }
                                })
                            if(req.body.services){
                                for(var i = 0; i < req.body.services.length; i++){
                                    Service.findOneAndUpdate({_id: req.body.services[i], destinations: {$ne: destination._id}}, {$push: {destinations: destination._id}}, {new: true})
                                        .then(function(){
                                            next()
                                        })
                                        .catch(function(err){
                                            console.log(err)
                                        })
                                }
                            }
                            Service.find({_id: {$nin: req.body.services}})
                                .then(function(services){
                                    for(var i = 0; i < services.length; i++){
                                        Service.findOneAndUpdate({_id: services[i]._id}, {$pull: {destinations: destination._id}}, {new: true})
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
                            res.redirect(`/me/stored/destinations/${account.username}`)                  
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
                if(account.role == "ctv1"){
                    Destination.findOneAndDelete({_id: id})
                        .then(function(destination){                           
                            Type.updateMany({destinations: destination._id}, {$pull: {destinations: destination._id}}, {new: true})
                                .then(function(){
                                    next()
                                })
                                .catch(next)
                            Service.updateMany({destinations: destination._id}, {$pull: {destinations: destination._id}}, {new: true})
                                .then(function(){
                                    next()
                                })
                                .catch(next)
                            Approval.findOneAndDelete({destinationId: destination._id})
                                .then(function(){
                                    next()
                                })
                                .catch(next)
                            Tour.updateMany({destinations: destination._id}, {$pull: {destinations: destination._id}}, {new: true})
                                .then(function(){
                                    next()
                                })
                                .catch(next)
                            res.redirect(`/me/stored/destinations/${account.username}`)
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
                    if(account.role == "ctv1"){
                        Destination.deleteMany({_id: { $in: req.body.destinations }})             //Duyệt qua những id có trong destinations
                            .then(function(){
                                Type.updateMany({destinations: {$in: req.body.destinations}}, {$pull: {destinations: {$in: req.body.destinations}}} ,{new: true})
                                    .then(function(){
                                        next()
                                    })
                                    .catch(next)
                                Service.updateMany({destinations: {$in: req.body.destinations}}, {$pull: {destinations: {$in: req.body.destinations}}} ,{new: true})
                                    .then(function(){
                                        next()
                                    })
                                    .catch(next)
                                Approval.deleteMany({destinationId: {$in: req.body.destinations}})
                                    .then(function(){
                                        next()
                                    })
                                    .catch(next)
                                Tour.updateMany({destinations: {$in: req.body.destinations}}, {$pull: {destinations: {$in: req.body.destinations}}} ,{new: true})
                                    .then(function(){
                                        next()
                                    })
                                    .catch(next)
                                res.redirect(`/me/stored/destinations/${account.username}`)
                            })
                            .catch(function(err){
                                console.log(err)
                            })
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

exports.filter = function(req, res, next){
    var district = req.params.districtID
    var ward = req.params.wardcode
    var types = req.params.typeID
    var services = req.params.serviceID
    var condition
    if(types.length > 1)
        types = types.split("&")
    else
        types = types.split("")
    if(services.length > 1)
        services = services.split("&")
    else    
        services = services.split("")
    
    if(district == "0"){
        if(types == "0"){
            condition = {
                services: {$in: services}
            }
        }
        else{
            if(services == "0"){
                condition = {
                    types: {$in: types}
                }
            }
            else{
                condition = {
                    types: {$in: types},
                    services: {$in: services}
                }
            }
        }
    }
    else{
        if(ward == "0"){
            if(types == "0"){
                if(services == "0"){
                    condition = {
                        districtId: district
                    }
                }
                else{
                    condition = {
                        districtId: district,
                        services: {$in: services}
                    }
                }
            }
            else{
                if(services == "0"){
                    condition = {
                        districtId: district,
                        types: {$in: types}
                    }
                }
                else{
                    condition = {
                        districtId: district,
                        types: {$in: types},
                        services: {$in: services}
                    }
                }
            }

        }
        else{
            if(types == "0"){
                if(services == "0"){
                    condition = {
                        districtId: district,
                        wardCode: ward
                    }
                }
                else{
                    condition = {
                        districtId: district,
                        wardCode: ward,
                        services: {$in: services}
                    }
                }
            }
            else{
                if(services == "0"){
                    condition = {
                        districtId: district,
                        wardCode: ward,
                        types: {$in: types}
                    }
                }
                else{
                    condition = {
                        districtId: district,
                        wardCode: ward,
                        types: {$in: types},
                        services: {$in: services}
                    }
                }
            }
        }
    }
    Approval.find({status: 1})
        .then(function(approvals){
            approvals = approvals.map(function(approvals){
                return approvals.toObject()
            })
            Destination.find(condition)
                .then(function(destinations){
                    destinations = destinations.map(function(destinations){
                        return destinations.toObject()
                    })
                    for(var i = 0; i < destinations.length; i++){
                        var check = 0
                        for(var j = 0; j < approvals.length; j++){
                            if(approvals[j].destinationId)
                                if(destinations[i]._id.toString() == approvals[j].destinationId.toString()){
                                    check = 1
                                    break
                                }
                        }
                        if(check == 0)
                            destinations.splice(i, 1)
                    }
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
                                                        res.render("home", {
                                                            destinations: destinations,
                                                            account: account,
                                                            types: types,
                                                            services: services
                                                        })
                                                    })
                                                    .catch(function(err){
                                                        console.log(err)
                                                    })
                                            }
                                            else{
                                                res.render("home", {
                                                    destinations: destinations,
                                                    types: types,
                                                    services: services
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
