'use strict';

var models = require('../models');
var fs = require('fs');
var mime = require('mime');
var pathJS = require('path');

/*
    * Returns partial content
    * res    = Response object from expressjs
    * file   = File to serve
    * length = Amount of bytes to send
    * start  = Position to start reading from file
    * range  = Range of bytes sent (Ex. 1000-2000)
    * size   = Total file size
*/
function returnData(res, file, length, start, range, size) {
    let crs = fs.createReadStream(file, { flags: "r", start: start, end: start + length });
    res.set({ 'Content-Range': 'bytes ' + range + '/' + size });
    res.set({ 'Content-Length': length });
    res.type(mime.lookup(file)).status(206);
    crs.pipe(res);
}

/*
    * Returns correct content-range, used when range sent is incorrect
    * res  = Response object from expressjs
    * size = Total file size
*/
function returnRange(res, size) {
    res.set({ 'Content-Range': 'bytes */' + size });
    res.sendStatus(416);
}

/*
    * Returns data from item when no range is given
    * res  = Response object from expressjs
    * path = Path to the item to be sent
    * size = Size of the item
*/
function returnNoRange(res, path, size) {
    models.settings.find({ where: { name: 'packetsize' } }).then(function (psize) {
        let dbsize = parseInt(psize.value);
        if (size > dbsize) {
            let returnrange = '0-' + (dbsize - 1);
            returnData(res, path, dbsize, 0, returnrange, size);
        }
        else {
            let returnrange = '0-' + (size - 1);
            returnData(res, path, size, 0, returnrange, size);
        }
    });
}

/*
    * Returns data from item when the start of the range is not given
    * res          = Response object from expressjs
    * path         = Path to the item to be sent
    * rangeSplit   = Range array of two items
    * size         = Size of the item
*/
function returnNoStart(res, path, rangeSplit, size) {
    if (parseInt(rangeSplit[1]) > size || parseInt(rangeSplit[1]) <= 0) {
        returnRange(size);
    } else {
        let returnrange = (size - parseInt(rangeSplit[1])) + '-' + (parseInt(size) - 1);
        returnData(res, path, parseInt(rangeSplit[1]), parseInt(size - parseInt(rangeSplit[1])), returnrange, size);
    }
}

/*
    * Returns data from item when the end of the range is not given
    * res          = Response object from expressjs
    * path         = Path to the item to be sent
    * rangeSplit   = Range array of two items
    * size         = Size of the item
*/
function returnNoEnd(res, path, rangeSplit, size) {
    if (parseInt(rangeSplit[0]) > size || parseInt(rangeSplit[0]) < 0) {
        returnRange(size);
    }
    else {
        let returnrange = parseInt(rangeSplit[0]) + '-' + (parseInt(size) - 1);
        returnData(res, path, parseInt(parseInt(size) - parseInt(rangeSplit[0])), parseInt(rangeSplit[0]), returnrange, size);
    }
}

/*
    * Returns specified range of data from item
    * res          = Response object from expressjs
    * path         = Path to the item to be sent
    * rangeSplit   = Range array of two items
    * size         = Size of the item
*/
function returnRange(res, path, rangeSplit, size) {
    if (parseInt(rangeSplit[0]) > size || parseInt(rangeSplit[0]) < 0) {
        returnRange(size);
    }
    else if (parseInt(rangeSplit[1]) > size || parseInt(rangeSplit[1]) < 0) {
        returnRange(size);
    }
    else {
        let returnrange = rangeSplit[0] + '-' + rangeSplit[1];
        returnData(res, path, parseInt(parseInt(rangeSplit[1]) - parseInt(rangeSplit[0]) + 1), parseInt(rangeSplit[0]), returnrange, size);
    }
}

/*
    * Manages which range condition is met
    * res   = Response object from expressjs
    * path  = Path to the item to be sent
    * range = Range of bytes to return
*/
function manageView(res, path, range) {
    fs.stat(path, function (err, stats) {
        if (err) {
            res.sendStatus(404);
            return false;
        }

        if (typeof range === 'undefined') {
            returnNoRange(res, path, stats.size);
        } else {
            let rangeSplit = range.replace('bytes=', '').replace('bytes: ', '').split('-');
            //TODO: LIMIT RANGE TO SOME AMOUNT!
            if (rangeSplit[0] === '') {
                // void - number
                returnNoStart(res, path, rangeSplit, stats.size);
            } else if (rangeSplit[1] === '') {
                // number - void
                returnNoEnd(res, path, rangeSplit, stats.size);
            } else {
                // number - number
                returnRange(res, path, rangeSplit, stats.size);
            }
        }
    });
}

//returns mime file
function manageMime(res, path) {
    res.sendFile(path);
}

/*
    * Manages returning partial content from virtual view
    * res    = Response object from expressjs
    * parent = Parent id in users_data table
    * name   = Name in users_data table
    * range  = Range of bytes to return
*/
function virtualView(res, id, name, range) {
    let type = mime.lookup(pathJS.extname(name));
    models.physical_items_mimes.find({ where: {iid: id, mime: type} }).then(function (data) {
        if(data !== null) {
            models.physical_items.find({ where: {id: id}}).then(function (item) {
                manageView(res, item.path, range);
            });
        }
        else {
            //searching for subtitle files
            models.physical_items.findAll({ where: {pid: id}}).then(function(subtitles) {
                if(subtitles !== null) {
                    var found = false;
                    for(let i in subtitles) {
                        models.physical_items_mimes.find( { where: {iid: subtitles[i].id, mime: type}}).then(function (mime) {
                            if(mime !== null) {
                                found = true;
                                manageMime(subtitles[i].path);
                            }
                        });
                    }
                    if(!found) {
                        res.sendStatus(404);
                    }
                }
                else {
                    res.sendStatus(404);
                }
            });

        }
    });
}

/*
    * Manages returning partial content from physical view
    * res    = Response object from expressjs
    * id     = Ido of in item in table
    * name   = Name in items table
    * range  = Range of bytes to return
*/
function physicalView(res, id, name, range) {
    /*models.physical_items.find({ where: { pid: parent, name: name  } }).then(function (data) {
        if(data !== null) {
            manageView(res, data.path, range);
        }
        else {
            res.sendStatus(404);
        }
    });*/
    let type = mime.lookup(pathJS.extname(name));
    models.physical_items_mimes.find({ where: {iid: id, mime: type} }).then(function (data) {
        if(data !== null) {
            models.physical_items.find({ where: {id: id}}).then(function (item) {
                manageView(res, item.path, range);
            });
        }
        else {
            //searching for subtitle files
            models.physical_items.findAll({ where: {pid: iid}}).then(function(subtitles) {
                if(subtitles !== null) {
                    var found = false;
                    for(let i in subtitles) {
                        models.physical_items_mimes.find( { where: {iid: subtitles[i].id, mime: type}}).then(function (mime) {
                            if(mime !== null) {
                                found = true;
                                manageMime(subtitles[i].path);
                            }
                        });
                    }
                    if(!found) {
                        res.sendStatus(404);
                    }
                }
                else {
                    res.sendStatus(404);
                }
            });

        }
    });
}

/*function virtualDirList(res, parent) {
    models.users_data.find({ where: { pid: parent} }).then(function (item) {
        if(item !== null) {
            if(item.subrip === 1) {
                models.items.find({ where: {id: item.iid}}).then(function (data) {
                    if(data !== null) {
                        let ret = {};

                        ret.folder.name = '/view/0/' + parent;
                        ret.item.srt.link = '/srt/0/' + parent + '/' + item.name + '.' + mime.extension('application/x-subrip');
                        ret.item.srt.name = item.name + '.' + mime.extension('application/x-subrip');
                        //TODO: get statsync
                        ret.item.srt.size = 10;
                        ret.item.file.link = '/view/0/' + parent + '/' + item.name + '.' + mime.extension(data.path);
                        ret.item.srt.name = '';
                        ret.item.srt.size = '';
                    }
                    else {
                        res.sendStatus(404);
                    }
                });
            }
            else {
                res.sendStatus(404);
            }

        }
        else {
            res.sendStatus(404);
        }
    });
}*/

exports.virtualView = virtualView;
exports.physicalView = physicalView;
//exports.virtualDirList = virtualDirList;
//exports.physicalDirList = physicalDirList;
