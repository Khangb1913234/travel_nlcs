const mongoose = require('mongoose')
const Village = require('../models/village.model')
const Destination = require("../models/destination.model")

exports.findAll = function(req, res, next){
    Village.find({})
        .then(function(villages){
            // villages = villages.map(function(villages){
            //     return villages.toObject()
            // })
            // res.render("me/stored_village", {
            //     villages: villages
            // })
            res.json(villages)
        })
        .catch(next)
}   


exports.findOne = function(req, res, next){
    const {id} = req.params
    Village.findOne({_id: id})
        .then(function(villages){
            //villages = villages.toObject()
            // res.render("villages/village", {
            //     villages: villages
            // })
            //res.json(villages)
            Destination.find({_id: {"$in": villages.destination} })
                .then(function(villages){
                    res.json(villages)
                })
                .catch(next)
        })
        .catch(next)
}

exports.findDistrict = function(req, res, next){
    const {districtCode} = req.params
    Village.findOne({code: districtCode})
        .then(function(villages){
            // villages = villages.toObject()
            // res.render("villages/village", {
            //     villages: villages
            // })
            res.json(villages)
            // Destination.find({_id: {"$in": villages.destination} })
            //     .then(function(villages){
            //         res.json(villages)
            //     })
            //     .catch(next)
        })
        .catch(next)
}
