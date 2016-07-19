'use strict';

var models = require('../models');
var utils = require('./utils');

//TODO: add comments

function physicalDirListing(uid) {
    return new Promise(function (resolve, reject) {
        utils.getPath(uid).then(function(paths) {
            let promiseArray = Array();
            for(let i in paths) {
                promiseArray.push(getDirListing(0, paths[i].path, paths[i].id));
            }

            Promise.all(promiseArray).then(function (data) {
                let ret = Array();
                for (let i in data) {
                    data[i].items.sort(utils.compareDirListing);
                    ret.concat(data[i]);
                }

                resolve(data);
            }).catch(function (err) {
                console.log("physicalDirListing = " + err);
                reject(err);
            });
        }).catch(function (err) {
            console.log("getPath in physicalDirListing err: " + err);
            reject(err);
        });
    });

}

//TODO: add comments
function virtualDirListing(uid) {
    return new Promise(function (resolve, reject) {
        //utils.getPath(uid).then(function(paths) {
            let promiseArray = Array();
            //for(let i in paths) {
            promiseArray.push(getDirListing2(0, null, uid));
            //}

            Promise.all(promiseArray).then(function (data) {
                for (let i in data) {
                    data[i].items.sort(utils.compareDirListing);
                }
                resolve(data);
            }).catch(function (err) {
                console.log("virtualDirListing = " + err);
                reject(err);
            });
        /*}).catch(function (err) {
            console.log("getPath in virtualDirListing err: " + err);
            reject(err);
        });*/
    });

}

//TODO: add comments
function seenDirListing(uid) {
    return new Promise(function (resolve, reject) {
        //utils.getPath(uid).then(function(paths) {
            let promiseArray = Array();
            //for(let i in paths) {
            promiseArray.push(getDirListing3(0, null, uid));
            //}

            Promise.all(promiseArray).then(function (data) {
                for (let i in data) {
                    data[i].items.sort(utils.compareDirListing);
                }
                resolve(data);
            }).catch(function (err) {
                console.log("seenDirListing = " + err);
                reject(err);
            });
        /*}).catch(function (err) {
            console.log("getPath in virtualDirListing err: " + err);
            reject(err);
        });*/
    });

}


/*
    * Recursively retrieves dir listing from db
    * level  = Starting directory (default 0)
    * folder = Name of the parent folder (Set to null on first call to not include parent)
*/
//TODO: fix comments
//TODO: remove seen link as its physical representation
function getDirListing(level, folder, upid) {
    var itemArray = { name: "parentDir", type: 0, items: Array() };
    return new Promise(function (resolve, reject) {
        models.physical_items.findAll({ where: { pid: level, upid: upid },  order: 'type ASC, name ASC' }).then(function (items) {
            let promiseArray = Array();
            if (folder !== null) {
                itemArray = { name: folder, type: 0, items: Array(), id: level, seen: utils.generateSeenUrl(level) };
            }

            /*utils.isSeen(level).then(function (tmp) {
                reject(tmp);
            }).catch(function (tmp) {   */
                var cycleItem = function (i) {
                    return new Promise(function (resolve2, reject2) {
                        //FIXME: get user id and fix spaghetti
                        //FIXME: check data field for data (seen, name...)
                        /*utils.isSeen(items[i].id).then(function (tmp2) {
                            resolve2(false);
                        }).catch(function (tmp2) {*/
                            if (items[i].type === 0) {
                                promiseArray.push(getDirListing(items[i].id, items[i].name, upid));
                                resolve2(true);
                            }
                            else {
                                utils.generatePhysicalViewUrl(items[i].id).then(function (viewUrl) {
                                    itemArray.items.push({ name: items[i].name, type: 1, id: items[i].id, url: viewUrl});
                                resolve2(true);
                                });

                            }
                        //});
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
            //});
        }).catch(function (err) {
            reject("dirlist err: " + err);
        });
    });
}

//TODO: merge with getdirlisting
function getDirListing2(level, folder, uid) {
    var itemArray = { name: null, type: 0, items: Array() };
    return new Promise(function (resolve, reject) {
        models.virtual_items.findAll({ where: { pid: level, uid: uid, seen: 0, deleted: 0 },  order: 'type ASC, name ASC' }).then(function (items) {
            let promiseArray = Array();
            if (folder !== null) {
                itemArray = { name: folder, type: 0, items: Array(), seen: utils.generateSeenUrl(level), deleted: utils.generateDeletedUrl(level), id: level };
            }
            //TODO: test if commenting didnt broke view (seeing seen videos and folders)
            /*utils.isSeenOrDeleted(level).then(function (tmp) {
                reject(tmp);
            }).catch(function (tmp) {*/
            var cycleItem = function (i) {
                return new Promise(function (resolve2, reject2) {
                    //FIXME: get user id and fix spaghetti
                    //FIXME: check data field for data (seen, name...)
                    //TODO: change resolve2 to reject2
                    /*utils.isSeenOrDeleted(items[i].id).then(function (tmp2) {
                        resolve2(false);
                    }).catch(function (tmp2) {*/

                    if (items[i].type === 0) {
                        promiseArray.push(getDirListing2(items[i].id, items[i].name, uid));
                        resolve2(true);
                    }
                    else {
                        utils.generateVirtualViewUrl(items[i].iid).then(function (viewUrl) {
                            itemArray.items.push({ name: items[i].name, type: 1, url: viewUrl, seen: utils.generateSeenUrl(items[i].id),
                            deleted: utils.generateDeletedUrl(items[i].id), id: items[i].id });
                            resolve2(true);
                        });

                    }
                    //});
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
            //});
        }).catch(function (err) {
            reject("dirlist err: " + err);
        });
    });
}

//TODO: merge with getdirlisting
function getDirListing3(level, folder, uid) {
    var itemArray = { name: null, type: 0, items: Array() };
    return new Promise(function (resolve, reject) {
        models.virtual_items.findAll({ where: { pid: level, uid: uid, seen: 1 },  order: 'type ASC, name ASC' }).then(function (items) {
            let promiseArray = Array();
            if (folder !== null) {
                itemArray = { name: folder, type: 0, items: Array(), seen: utils.generateSeenUrl(level) };
            }

            /*utils.isSeen(level).then(function (tmp) {
                reject(tmp);
            }).catch(function (tmp) {     */
            var cycleItem = function (i) {
                return new Promise(function (resolve2, reject2) {
                    //FIXME: get user id and fix spaghetti
                    //FIXME: check data field for data (seen, name...)
                    /*utils.isSeen(items[i].id).then(function (tmp2) {
                        resolve2(false);
                    }).catch(function (tmp2) {*/
                    if (items[i].type === 0) {
                        promiseArray.push(getDirListing3(items[i].id, items[i].name, uid));
                        resolve2(true);
                    }
                    else {
                        utils.generateVirtualViewUrl(items[i].iid).then(function (viewUrl) {
                            itemArray.items.push({ name: items[i].name, type: 1, url: viewUrl, seen: utils.generateSeenUrl(items[i].id),
                            deleted: utils.generateDeletedUrl(items[i].id), id: items[i].id });
                            resolve2(true);
                        });
                    }
                    //});
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
            //});
        }).catch(function (err) {
            reject("seenlist err: " + err);
        });
    });
}

//exports.getDirListing = getDirListing;
exports.physicalDirListing = physicalDirListing;
exports.virtualDirListing = virtualDirListing;
exports.seenDirListing = seenDirListing;
