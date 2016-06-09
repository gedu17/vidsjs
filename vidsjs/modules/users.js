'use strict';

var models = require('../models');

/*
    * Returns link for login in passwordless mode
    * id = user id
*/
function getUserSetLink(id) {
    return "/login/setuser/"+id;
}

/*
    * Hashes password
    * password = password to be hashed
*/
//TODO: Implement
function hashPassword(password) {
    return password;
}

/*
    * Validates login information
    * data = req.body with userid and password to be checked
*/
function checkLogin(data) {
    return new Promise(function (resolve, reject) {
        models.users.find({where: {id: data.userid, password: hashPassword(data.password)}}).then(function(data) {
            if(data !== null) {
                resolve({id: data.id, name: data.name, level: data.level});
            }   
            else {
                reject("Bad password.");
            } 
        }).catch(function(err) {
            reject(err);
        });
    });
}

/*
    * Returns user data
    * id = user id
*/
function getUserData(id) {
    return new Promise(function (resolve, reject) {
        models.users.find({where: {id: id}}).then(function(data) {
            if(data !== null) {
                resolve({id: data.id, name: data.name, level: data.level});
            }   
            else {
                reject("Bad user id.");
            } 
        }).catch(function(err) {
            reject(err);
        });
    });
}

/*
    * Returns data for login template
    * error = error to add to template
*/
function getLogin(error) {
    return new Promise(function (resolve, reject) {
        models.users.findAll().then(function(data) {
            var ret = {error: error, users: Array()};
            if(data !== null) {
                data.map(function (obj) {
                    ret.users.push({"name": obj.name, "id": obj.id});
                });   
                resolve(ret);
            }   
            else {
                reject("No users.");
            } 
        }).catch(function(err) {
            reject(err);
        });
    });
}

/*
    * Returns data for passwordless login template
*/
function getUserList() {
    return new Promise(function (resolve, reject) {
        models.users.findAll().then(function(data) {
            var ret = Array();
            if(data !== null) {
                data.map(function (obj) {
                    ret.push({"name": obj.name, "link": getUserSetLink(obj.id)});
                });   
                resolve(ret);
            }   
            else {
                reject("No users");
            } 
        }).catch(function(err) {
            reject(err);
        });
    });
}

exports.getUserList = getUserList;
exports.getLogin = getLogin;
exports.checkLogin = checkLogin;
exports.getUserData = getUserData;