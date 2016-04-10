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

/* GET home page. */
router.get('/', function (req, res) {
    mods.dirlist.getDirListing(0, null).then(function (cont) {
        //FIXME: BAD SORTING ???
        let a = new Promise(function (resolve, reject) {
            /*console.log("before sort: ");// + cont.items);
            for (let i in cont.items) {
                console.log(cont.items[i]);
            }*/
            cont.items.sort(mods.utils.compareDirListing);
            /*console.log("after sort:  ");// + cont.items);
            for (let i in cont.items) {
                console.log(cont.items[i]);
            }*/
            resolve(true);
        });
        a.then(function (tmp) {
            res.render('dirlist', { content: cont });
        });
        
    }).catch(function (err) {
        console.log("route / " + err);
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
    console.log(req);
    res.sendStatus(404);
});

router.get('/scanDirs', function (req, res) {
    mods.dirscan.scan().then(function (number) {
        let num = parseInt(number);
        if (num === 0) {
            res.render('index', { content: 'list is up to date !' });
        } else if (num === -1) {
            res.render('index', { content: 'failed to delete ' + number + ' items' });
        } else {
            res.render('index', { content: number + 'items has been deletered' });
        }
    }).catch(function (err) {
        console.log("dirscan err = " + err);
    });
});

module.exports = router;