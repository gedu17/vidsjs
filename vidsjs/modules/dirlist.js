'use strict';

var models = require('../models');
var utils = require('./utils');

/*
    * Recursively retrieves dir listing from db
    * level  = Starting directory (default 0)
    * folder = Name of the parent folder (Set to null on first call to not include parent)
*/
function getDirListing(level, folder) {
    var itemArray = { name: "parentDir", type: 0, items: Array() };
    return new Promise(function (resolve, reject) {
        models.items.findAll({ where: { parent: level },  order: 'type ASC, name ASC' }).then(function (items) {
            let promiseArray = Array();
            if (folder !== null) {
                itemArray = { name: folder, type: 0, items: Array(), seen: utils.generateSeenUrl(level) };
            }
            
            utils.isSeen(level).then(function (tmp) {
                reject(tmp);
            }).catch(function (tmp) {                
                var cycleItem = function (i) {
                    return new Promise(function (resolve2, reject2) {
                        //FIXME: get user id and fix spaghetti
                        //FIXME: check data field for data (seen, name...)
                        utils.isSeen(items[i].id).then(function (tmp2) {
                            resolve2(false);
                        }).catch(function (tmp2) {
                            if (items[i].type === 0) {
                                promiseArray.push(getDirListing(items[i].id, items[i].name));
                                resolve2(true);
                            } 
                            else {
                                itemArray.items.push({ name: items[i].name, type: 1, url: utils.generateViewUrl(items[i].id), seen: utils.generateSeenUrl(items[i].id) });
                                resolve2(true);
                            }
                        });
                    });
                }

                var cyclePromises = Array();
                for (let i in items) {
                    cyclePromises.push(cycleItem(i));
                }
                
                Promise.all(cyclePromises).then(function (tmp3) {
                    if (promiseArray.length > 0) {
                        Promise.all(promiseArray).then(function (data) {
                            for (let i in data) {
                                data[i].items.sort(utils.compareDirListing);
                                itemArray.items.push(data[i]);
                            }
                            resolve(itemArray);
                        });
                    } else {
                        resolve(itemArray);
                    }
                });
            });
        }).catch(function (err) {
            reject("dirlist err: " + err);
        });
    });
}

exports.getDirListing = getDirListing;