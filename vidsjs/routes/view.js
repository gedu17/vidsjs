'use strict';

var express = require('express');
var jade = require('jade');
var Sequelize = require('sequelize');
var mods = require('../modules');
var models = require('../models');
var router = express.Router();

router.get('/view/:id', function (req, res) {
    mods.view.view(res, req.params.id, req.get('Range'));
});

/* debuging some strange requests */
router.get('/', function (req, res) {
    //console.log(req);
    res.sendStatus(404);
});

//TODO: merge routes to 1
//Type 0 - Virtual view
//Type 1 - Physical view
//Parent - id of the parent folder
//Item - name of the item
router.get('/:id/:name', function (req, res) {
    mods.view.virtualView(res, req.params.id, req.params.name, req.get('Range'));
});

module.exports = router;
