'use strict';

var pathJS = require('path');
var models = require('../models');
var os     = require('os');
/*
    * Fetches acceptable video extensions/formats
*/

//TODO: change file extensions to mime types
function getTypes() {
    return new Promise(function (resolve, reject) {
        models.settings.find({ where: { name: 'filetypes' } }).then(function (ft) {
            if (ft === null) {
                reject("no types found");
            }
            else {
                resolve(ft.value.split(';'));
            }
        }).catch(function (err) {
            reject("Filetypes not found: " + err);
        });
    });
}

/*
    * Fetches video directories from users_data table
    * uid = Id of the user
*/
function getPath(uid) {
    return new Promise(function (resolve, reject) {
        models.users_settings.findAll({ where: { type: 'path', uid: uid } }).then(function (path) {
            if (path === null) {
                reject("No paths found in db");
            }
            else {
                let ret = Array();
                for(let i in path) {
                    let tmp = path[i].value.split(';');
                    tmp = tmp.join(pathJS.sep);
                    if(os.type() === 'Linux' || os.type() === 'Darwin') {
                        tmp = '/' + tmp;
                    }
                    ret.push({path: tmp, id: path[i].id});
                }
                resolve(ret);
            }
        }).catch(function (err) {
            reject("get path: " + err);
        });
    });
}

/*
    * Returns the file extension and removes the dot from extension name
    * file = File name with extension
*/
function fixExtension(file) {
    return pathJS.extname(file).substring(1, file.length);
}

/*
    * Function to sort File listing from Db (used by array.sort)
    * Priority to folders over files
    * After that sorts alphabetically
*/
function compareDirListing(a, b) {
    if (a.type === 1 && b.type === 1) {
        return a.name.localeCompare(b.name);
    } else if (a.type === 1 && b.type === 0) {
        return 1;
    } else if (a.type === 0 && b.type === 1) {
        return -1;
    } else {
        return a.name.localeCompare(b.name);
    }
}

/*
    * Returns link to a video
    * id = Id of the video in database
*/

//FIXME: implement
function generateViewUrl(id) {
    return '/view/' + id;
}

/*
    * Returns link to flag item as seen
    * id = Id of the item in database
*/
//FIXME: implement
function generateSeenUrl(id) {
    return '/seen/' + id;
}

/*
    * Returns link to flag item as deleted
    * id = Id of the item in database
*/
//FIXME: implement
function generateDeletedUrl(id) {
    return '/deleted/' + id;
}


/*
    * Returns boolean wether item is flagged as seen by user
    * id = Id of the item in database
*/
function isSeenOrDeleted(id) {
    return new Promise(function (resolve, reject) {
        if(id > 0) {
            models.users_data.find({ where: { id: id } }).then(function (par) {
                if (par === null) {
                    reject(false);
                }
                if (par.seen > 0 || par.deleted > 0) {
                    resolve(true);
                }
                reject(false);
            });
        }
        else {
            reject(false);
        }
    });
}

/*
    * Changes item name in users_data table
    * id   = Id of the item in database
    * name = New name
*/
function changeItemName(id, name) {
    return new Promise(function (resolve, reject) {
        models.users_data.find({ where: {id: id}, limit: 1}).then(function (data) {
            if(data === null) {
                reject("id not found");
            }
            models.users_data.update({data: name}, {where: {id: id}, limit: 1}).then(function (data) {
                resolve("name changed");  
            });
        });
    });
}

/*
    * Creates folder in users_data
    * name   = Name of the folder
    * parent = Parent id
    * uid    = Id of the user
*/
function createFolder(name, parent, uid) {
    return new Promise(function (resolve, reject) {
        models.users_data.create({ user: uid, data: name, item: 0, seen: 0, deleted: 0, parent: parent, type: 0 }).then(function (data) {
            resolve(true);
        }).catch(function (data) {
            reject(false);
        });
        
    });
}

/*
    * Returns wether user needs to authenticate with a password
*/
function getLoginType() {
    return new Promise(function (resolve, reject) {
        models.settings.find({ where: { name: 'loginrequired' } }).then(function (lr) {
            if (lr === null) {
                reject("Setting not found");
            }
            else {
                resolve(parseInt(lr.value));
            }
        }).catch(function (err) {
            reject("Setting login required not found: " + err);
        });
    });
}

exports.getTypes = getTypes;
exports.getPath = getPath;
exports.fixExtension = fixExtension;
exports.compareDirListing = compareDirListing;
exports.generateViewUrl = generateViewUrl;
exports.generateSeenUrl = generateSeenUrl;
exports.generateDeletedUrl = generateDeletedUrl;
exports.isSeenOrDeleted = isSeenOrDeleted;
exports.getLoginType = getLoginType;
exports.changeItemName = changeItemName;
exports.createFolder = createFolder;