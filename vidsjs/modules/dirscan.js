'use strict';
var models = require('../models');
var utils = require('./utils');
var items = require('./items');

var pathJS = require('path');
var itemList = new items();
var fs = require('fs');
//TODO: check if need to initialized before scan or at the start of it !
var fileTypes = '';//utils.getTypes();
var basePath = '';//utils.getPath();

/*
    * Checks wether file extension matches allowed ones
    * ext = extension
*/
//TODO: change file extensions to mime types
function checkType(ext) {
    let found = false;
    for (let i in fileTypes) {
        if (fileTypes[i] === ext) {
            found = true;
            break;
        }
    }
    return found;
}

/*
    * Deletes items from database which cannot be found in directory structure
*/
function deleteMissingItems() {
    return new Promise(function (resolve, reject) {
        if (itemList.items.length > 0) {
            for (let i in itemList.items) {
                models.items.destroy({ where: { id: itemList.items[i].id }, limit: 1 });
            }
            itemList.items.length = 0;
            resolve(true);
        }
        else {
            resolve(false);
        }
    });
}

/*
    * Fills item list with items from database
*/
function init() {
    return new Promise(function (resolve, reject) {
        utils.getPath().then(function (data) {
            basePath = data;
        });
        utils.getTypes().then(function (data) {
            fileTypes = data;
           
        });
        resolve(true);
    });
}

function fillItemList() {
    return new Promise(function (resolve, reject) {
        models.items.findAll().then(function (allitems) {
            allitems.map(function (obj) {
                //TODO: Check if this works (reworked into promise)
                itemList.addItem({ path: obj.path, id: obj.id });
            });            
            resolve(true);
        }).catch(function (err) {
            reject(err);
        });
    });
}

/*
    * Reads directory
    * path  = path to directory
    * level = parent id in database (0 for first call)
*/

//TODO: FIX ME REMOVING ALL ITEMS FROM DB WHEN RESCANING?!
//FIXME: ASYNC READDIR
function readDir(path, level) {
    return new Promise(function (resolve, reject) {
        path = path.concat(pathJS.sep);
        //fs.readdir(path, function (data) {
        let data = fs.readdirSync(path);
            var cycle = new Promise(function (resolve, reject) {
                var itemArray = Array();
                //TODO: check if data is still here or if it is undefined
                for (let i in data) {
                    let newPath = path.concat(data[i]);
                    fs.stat(newPath, function (err, stats) {
                        if (!err) {
                            var newlevel = 0;
                            if (stats.isDirectory()) {
                                itemList.removeItem({ path: newPath }).then(function (msg) {
                                    itemArray.push(readDir(newPath, parseInt(msg)));
                                }).catch(function (msg) {
                                    //console.log("msg = " + msg);
                                    models.items.create({ name: data[i], parent: level, type: 0, path: newPath }).then(function (createditem) {
                                        newlevel = createditem.id;
                                        itemArray.push(readDir(newPath, newlevel));
                                    });
                                });
                            } else {
                                if (checkType(utils.fixExtension(data[i]))) {
                                    itemList.removeItem({ path: newPath }).catch(function (msg) {
                                        let tmp = pathJS.parse(data[i]);
                                        models.items.create({ name: tmp.name, parent: level, type: 1, path: newPath });
                                    });
                                }
                            }
                        }
                    });
                }

                resolve(itemArray);
            });

            cycle.then(function (promiseArray) {
                if (promiseArray.length > 0) {
                    Promise.all(promiseArray).then(function (data) {
                        resolve(itemList.items.length);
                    });
                } else {
                    resolve(itemList.items.length);
                }
            }).catch(function (err) {
                console.log("errrrrr " + err);
            });
        //});
    });
}

/*
    * Public method to initiate scan, returns integer:
    *   -1 if failed
    *    0 if nothing was changed
    *    x number of items deleted
*/
function scan() {
    return new Promise(function (resolve, reject) {
        init().then(function (asd) {
            fillItemList().then(function (bool) {
                readDir(basePath, 0).then(function (number) {
                    if (parseInt(number) > 0) {
                        deleteMissingItems().then(function (returned) {
                            if (returned) {
                                resolve(number);
                            } else {
                                reject("Failed to delete " + number + " items.");
                            }
                        });
                    } else {
                        resolve(0);
                    }
                }).catch(function (err) {
                    console.log("readdir = " + err);
                    reject(err);
                });
            }).catch(function (err) {
                console.log("Failed scandir: " + err);
                reject(err);
            });
        });
    });
}

exports.scan = scan;