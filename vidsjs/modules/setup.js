'use strict';

var models = require('../models');

//Global variable, is used to stop from redirecting to login page if checkSetup failed.
var isSetup = false;

/*
    * Checks wether system has been set up properly
    * req  = Expressjs request object
    * res  = Expressjs response object
    * next = Expressjs next object
*/
function checkSetup(req, res, next) {;
    models.users.count().then(function (count) {
        let path = req.path.substring(1).split('/');
        if(count === 0) {
            if(path[0] !== 'setup') {
                res.redirect('/setup');
            }
            else {
                isSetup = true;
                next();
            }
        }
        else {
            let promiseArray = Array();
            promiseArray.push(checkSetting("packetsize"));
            promiseArray.push(checkSetting("loginmethod"));

            Promise.all(promiseArray).then(function (data) {
                next();
            }).catch(function (err) {
                if(path[0] != 'missingsettings') {
                    console.log("checkSetup error: " + err);
                    res.redirect('/missingsettings');
                }
                else {
                    isSetup = true;
                    next();
                }
            });
        }
    });
}

/*
    * Checks wether user is logged in or not, if not redirects
    * Ignores view route as it is most likely accessed by some program that is not the browser
    * req  = Expressjs request object
    * res  = Expressjs response object
    * next = Expressjs next object
*/
function checkLogin(req, res, next) {
    if(isSetup === true) {
        next();
    }
    else {
        let path = req.path.substring(1).split('/');
        if(path[0] !== 'login' && path[0] !== 'view' && path[0] !== 'pview') {
            if(typeof req.session.uid === "undefined") {
                res.redirect('/login');
            }
            else {
                next();
            }
        }
        else {
            next();
        }
    }

}

/*
    * Checks if setting exists in database
    * name = Setting name
*/
function checkSetting(name) {
    return new Promise(function(resolve, reject) {
        models.settings.count({where: {name: name} }).then(function (count) {
            if(count === 0) {
                reject("Setting " + name + " not found in databse.");
            }
            resolve(true);
        });
    });
}

/*
    * Creates settings items and administrator users
    * req = Expressjs request object
    * res = Expressjs response object
*/
function setup(body) {
    return new Promise(function(resolve, reject) {
        models.settings.create({name: "packetsize", value: body.packetsize});
        models.settings.create({name: "loginmethod", value: body.loginmethod});
        models.users.create({name: body.username, password: (body.password), active: 1, level: 9})
        .then(function (data) {
            resolve({uid: data.id, name: body.username, level: 9});
        });
    });
}

exports.checkLogin = checkLogin;
exports.checkSetup = checkSetup;
exports.setup      = setup;
