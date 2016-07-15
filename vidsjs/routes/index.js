'use strict';

var express = require('express');
var jade = require('jade');
var Sequelize = require('sequelize');
var mods = require('../modules');
var router = express.Router();

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


router.get('/api/virtlist', function (req, res) {
    mods.dirlist.virtualDirListing(req.session.uid).then(function (cont) {
        res.render('virtlist_ajax', { content: cont });
    }).catch(function (err) {
        console.log("route /api/virlist " + err);
        res.sendStatus(500);
    });
});

router.get('/seen/:id', function (req, res) {
    mods.seen.seen(res, req.params.id);

});

router.get('/deleted/:id', function (req, res) {
    mods.deleted.deleted(res, req.params.id);

});

router.get('/changeItemName/:id/:name', function (req, res) {
    mods.utils.changeItemName(req.params.id, req.params.name).then(function (params) {
        res.sendStatus(200);
    }).catch(function (params) {
        console.log("changeItemName error !");
        res.sendStatus(500);
    });
});

router.get('/createFolder/:parent/:name', function (req, res) {
    mods.utils.createFolder(req.params.name, req.params.parent, req.session.uid).then(function (params) {
        res.sendStatus(200);
    }).catch(function (params) {
        console.log("createFolder error !");
        res.sendStatus(500);
    });
});

router.get('/moveItem/:id/:parent', function (req, res) {
    mods.utils.moveItem(req.params.id, req.params.parent, req.session.uid).then(function (params) {
        res.sendStatus(200);
    }).catch(function (params) {
        console.log("moveItem error !");
        res.sendStatus(500);
    });
});

router.get('/pview/:id/:name', function (req, res) {
    mods.view.physicalView(res, req.params.id, req.params.name, req.get('Range'));
});

/*router.get('/view/:type/:parent', function (req, res) {
    if(req.params.type === 0) {
        mods.view.virtualDirList(res, req.params.parent);
    }
    else if(req.params.type === 1) {
        mods.view.physicalDirList(res, req.params.parent);
    }
    else {
        req.sendStatus(404);
    }

});*/


router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
})

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
