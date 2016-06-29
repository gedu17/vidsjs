'use strict';

var express = require('express');
var jade = require('jade');
var Sequelize = require('sequelize');
var mods = require('../modules');
var router = express.Router();

function getUserDefinedName(id) {
    //TODO: IMPLEMENT
    return new Promise(function (resolve, reject) {
        models.items.find({ where: { id: id } }).then(function (data) {
            resolve(pathJS.basename(data.path));
        }).catch(function (err) {
            reject(err);
        });
    });
    
    
}

/* GET returns physical directory listing */
router.get('/', function (req, res) {
    //mods.dirlist.physicalDirListing(req.session.uid).then(function (cont) {
    //res.render('dirlist', { content: {msg: "NOT IMPLEMENTED", items: null} });
    /*}).catch(function (err) {
        console.log("route / " + err);
        res.sendStatus(500);
    });*/
    mods.dirlist.virtualDirListing(req.session.uid).then(function (cont) {
        res.render('virtlist', { content: cont });
    }).catch(function (err) {
        console.log("route / " + err);
        res.sendStatus(500);
    });
});

router.get('/pview', function (req, res) {
    mods.dirlist.physicalDirListing(req.session.uid).then(function (cont) {
        res.render('dirlist', { content: cont });
    }).catch(function (err) {
        console.log("route /pview " + err);
        res.sendStatus(500);
    });
});

router.get('/sview', function (req, res) {
    //mods.dirlist.physicalDirListing(req.session.uid).then(function (cont) {
    //res.render('dirlist', { content: {msg: "NOT IMPLEMENTED", items: null} });
    mods.dirlist.seenDirListing(req.session.uid).then(function (cont) {
        console.log(cont);
        res.render('virtlist', { content: cont });
    }).catch(function (err) {
        console.log("route /sview " + err);
        res.sendStatus(500);
    });
});


router.get('/api/dirlist', function (req, res) {
    mods.dirlist.getDirListing(0, null).then(function (cont) {
        cont.items.sort(mods.utils.compareDirListing);
        res.render('dirlist', { content: cont });
    }).catch(function (err) {
        console.log("route /api/dirlist " + err);
    });
});

router.get('/view/:id', function (req, res) {
    mods.view.view(res, req.params.id, req.get('Range'));
});

router.get('/seen/:id', function (req, res) {
    mods.seen.seen(res, req.params.id);
    
});

/* debuging some strange requests */
router.get('/view', function (req, res) {
    //console.log(req);
    res.sendStatus(404);
});

router.get('/scanDirs', function (req, res) {
    mods.dirscan.dirscan(req.session.uid).then(function (params) {
        console.log("changed = " + params);
        res.render('index', { content: 'list is up to date !' });
    }).catch(function (err) {
        console.log("dirscan = " + err);
    });
    /*mods.dirscan.scan().then(function (number) {
        let num = parseInt(number);
        if (num === 0) {
            res.render('index', { content: 'list is up to date !' });
        } else if (num === -1) {
            res.render('index', { content: 'failed to delete ' + number + ' items' });
        } else {
            res.render('index', { content: number + ' items has been deleted' });
        }
    }).catch(function (err) {
        console.log("dirscan err = " + err);
    });*/
});

module.exports = router;