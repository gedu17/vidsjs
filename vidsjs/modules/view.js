'use strict';

var models = require('../models');
var fs = require('fs');
var mime = require('mime');

/*
    * Returns partial content
    * res    = response object from expressjs
    * file   = file to serve
    * length = amount of bytes to send
    * start  = position to start reading from file
    * range  = range of bytes sent (Ex. 1000-2000)
    * size   = total file size
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
    * res  = response object from expressjs
    * size = total file size
*/
function returnRange(res, size) {
    res.set({ 'Content-Range': 'bytes */' + size });
    res.sendStatus(416);
}

/*
    * Manages returning partial content
    * res = response object from expressjs
    * id  = id from request object
*/
function view(res, id, Range) {
    models.items.find({ where: { id: id } }).then(function (data) {
        if(data !== null) {
            fs.stat(data.path, function (err, stats) {
                if (err) {
                    res.sendStatus(404);
                    return false;
                }

                let returnrange = '';
                if (data !== null) {
                    if (typeof Range === 'undefined') {
                        models.settings.find({ where: { name: 'packetsize' } }).then(function (psize) {
                            let dbsize = parseInt(psize);
                            if (stats.size > dbsize) {
                                returnrange = '0-' + (dbsize - 1);
                                returnData(res, data.path, dbsize, 0, returnrange, stats.size);
                            }
                            else {
                                returnrange = '0-' + (stats.size - 1);
                                returnData(res, data.path, stats.size, 0, returnrange, stats.size);
                            }
                        });
                    } else {
                        let sp = Range.replace('bytes=', '').split('-');
                        //TODO: LIMIT RANGE TO SOME AMOUNT!
                        // void - number
                        if (sp[0] === '') {
                            if (parseInt(sp[1]) > stats.size || parseInt(sp[1]) <= 0) {
                                returnRange(stats.size);
                            } else {
                                returnrange = (stats.size - parseInt(sp[1])) + '-'
                                    + (parseInt(stats.size) - 1);
                                returnData(res, data.path, parseInt(sp[1]),
                                    parseInt(stats.size - parseInt(sp[1])), returnrange, stats.size);
                            }
                            // number - void
                        } else if (sp[1] === '') {
                            if (parseInt(sp[0]) > stats.size || parseInt(sp[0]) < 0) {
                                returnRange(stats.size);
                            }
                            else {
                                returnrange = parseInt(sp[0]) + '-' + (parseInt(stats.size) - 1);
                                returnData(res, data.path, parseInt(parseInt(stats.size) -
                                    parseInt(sp[0])), parseInt(sp[0]), returnrange, stats.size);
                            }
                            // number - number
                        } else {
                            if (parseInt(sp[0]) > stats.size || parseInt(sp[0]) < 0) {
                                returnRange(stats.size);
                            }
                            else if (parseInt(sp[1]) > stats.size || parseInt(sp[1]) < 0) {
                                returnRange(stats.size);
                            }
                            else {
                                returnrange = sp[0] + '-' + sp[1];
                                returnData(res, data.path, parseInt(parseInt(sp[1]) -
                                    parseInt(sp[0]) + 1), parseInt(sp[0]), returnrange, stats.size);
                            }
                        }
                    }
                }
                else {
                    res.sendStatus(404);
                }
            });/*.catch(function (err) {
                console.log("err = " + err);
                res.sendStatus(500);
            });*/
        }
    }).catch(function (err) {
        console.log("err = " + err);
        res.sendStatus(500);
    });
        
}

exports.view = view;