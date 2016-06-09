var express = require('express');
var router = express.Router();
var mods = require('../modules');
var models = require('../models');

/* GET users login template */
router.get('/', function (req, res) {
    mods.utils.getLoginType().then(function (type) {
        if(type === 0) {
            mods.users.getUserList().then(function(users) {
                res.render('userlist', {data: users});
            }).catch(function(err) {
                console.log(err);
            });
        } 
        else {
            mods.users.getLogin("").then(function(users) {
                res.render('userlogin', {data: users});
            }).catch(function(err) {
                console.log(err);
            });
            
        }
    }).catch(function(err) {
        console.log(err);
        res.sendStatus(500);
    });
});

/* GET user passwordless login  */
router.get('/setuser/:id', function (req, res) {
    mods.users.getUserData(req.params.id).then(function (data) {
        req.session.uid = data.id;
        req.session.name = data.name;
        req.session.level = data.level;
        res.redirect('/');
    }).catch(function (err) {
        console.log(err);
        //TODO: show proper error msg
        res.sendStatus(404);
    })
    
});

/* POST user login data */
router.post('/', function(req, res) {
    mods.users.checkLogin(req.body).then(function(data) {
        req.session.uid = data.id;
        req.session.name = data.name;
        req.session.level = data.level;
        res.redirect('/');
    }).catch(function(err) {
        mods.users.getLogin(err).then(function(users) {
            res.render('userlogin', {data: users});
        }).catch(function(err) {
            console.log(err);
        });
    });
});

module.exports = router;