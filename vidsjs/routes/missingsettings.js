'use strict';

var express = require('express');
var jade = require('jade');
var Sequelize = require('sequelize');
var mods = require('../modules');
var router = express.Router();

router.get('/', function (req, res) {
    console.log("!!TODO!! render missing items template with fields to enter values");
    res.sendStatus(404);
});

module.exports = router;
