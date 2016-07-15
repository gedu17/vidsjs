'use strict';

var models = require('../models');
var utils = require('./utils');

/*
    * Returns link for login in passwordless mode
    * id = user id
*/
function getUserSetLink(id) {
    return "/login/setuser/"+id;
}


/*
    * Validates login information
    * data = req.body with userid and password to be checked
*/
function checkLogin(data) {
    return new Promise(function (resolve, reject) {
        models.users.find({where: {id: data.userid, password: utils.hashPassword(data.password)}}).then(function(data) {
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
        var ret = Array();
        models.users.findAll({where: {active: 1}}).then(function(data) {
            if(data !== null) {
                var promiseArray = new Array();
                var cycle = function(obj) {
                    return new Promise(function (resolve2, reject2) {
                        models.virtual_items.count({where: {uid: obj.id}}).then(function (count) {
                            resolve2({"name": obj.name, "link": getUserSetLink(obj.id), "level": obj.level, "itemCount": count});
                        });
                    });
                }

                for(let i in data) {
                    promiseArray.push(cycle(data[i]));
                }

                Promise.all(promiseArray).then(function (data2) {
                    let ret = Array();
                    data2.map(function (obj) {
                        ret.push(obj);
                    });
                    resolve(ret);
                });
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
