'use strict';

var express = require('express');
var jade = require('jade');
var Sequelize = require('sequelize');
var mods = require('../modules');
var models = require('../models');
var router = express.Router();
//Constants used in settings installation
const packetSize = 15000000;

router.get('/', function (req, res) {
    models.users.count().then(function (count) {
        if(count === 0) {
            res.render('setup', {packetSize: packetSize});
        }
        else {
            res.redirect('/');
        }
    });    
});

router.post('/', function (req, res) {
    mods.setup.setup(req.body).then(function (data) {
        req.session.uid = data.uid;
        req.session.name = data.name;
        req.session.level = data.level;
        res.redirect('/');
    });
});

module.exports = router;
