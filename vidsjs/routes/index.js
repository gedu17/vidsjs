'use strict';
var models = require('../models');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pathJS = require('path');
var Sequelize = require('sequelize');
var filetypes = Array();
var items = require('../items');
var mime = require('mime');

function checkType(ext, ft) {
    let found = false;
    for (let i in ft) {
        if (ft[i] === ext) {
            found = true;
            break;
        }
    }
    return found;
}

function deleteMissingItems(cl) {
    return new Promise(function (resolve, reject) {
        if (cl.items.length > 0) {
            for (let i in cl.items) {
                models.items.destroy({ where: { id: cl.items[i].id }, limit: 1 });
            }
            cl.items.length = 0;
            resolve(true);
        } 
        else {
            resolve(false);
        }
    });
}

function readDir(path, ft, level, cl) {
    
    return new Promise(function (resolve, reject) {
        path = path.concat(pathJS.sep);
        //TODO: change to async !      
        let data = fs.readdirSync(path);
        
        var cycle = new Promise(function (resolve, reject) {
            var tmparr = Array();
            for (let i in data) {
                let newPath = path.concat(data[i]);
                let stats = fs.statSync(newPath);
                var newlevel = 0;
                if (stats.isDirectory()) {
                    
                    cl.removeItem({ path: newPath }).then(function (msg) {
                        //TODO: remove parseint?
                        tmparr.push(readDir(newPath, ft, parseInt(msg), cl));
                    }).catch(function (msg) {
                        models.items.create({ name: data[i], parent: level, type: 0, path: newPath }).then(function (createditem) {
                            newlevel = createditem.id;
                            tmparr.push(readDir(newPath, ft, newlevel, cl));
                        });
                    });
                }
                else {
                    if (checkType(fixExtension(data[i]), ft)) {
                        cl.removeItem({ path: newPath }).catch(function (msg) {
                            let tmp = pathJS.parse(data[i]);
                            models.items.create({ name: tmp.name, parent: level, type: 1, path: newPath });
                        });
                    }
                }
            }
            resolve(tmparr);
        });
        
        cycle.then(function (promarr) {
            if (promarr.length > 0) {
                Promise.all(promarr).then(function (dat) {
                    resolve(cl.items.length);
                });
            }
            else {
                resolve(cl.items.length);
            }
        });      
    });
}

function getDirListing(level, times, folder) {
    let data = '';
    return new Promise(function (resolve, reject) {
        models.items.findAll({ where: { parent: level }, order: 'type ASC, name ASC' }).then(function (items) {
            let promarr = Array();
            let foldersExist = false;
            for (let i in items) {
                if (items[i].type === 0) {
                    foldersExist = true;
                    break;
                }
            }
            if (folder !== null && !foldersExist) {
                data = data.concat("|" + leftPadding(times) + "#" + folder + "\n");
            }
            for (let i in items) {
                if (items[i].type === 0) {
                    promarr.push(getDirListing(items[i].id, times + 1, items[i].name));
                }
                else {
                    data = data.concat("|" + leftPadding(times) + "-" + items[i].name + "\n");
                }
            }
            
            if (promarr.length > 0) {
                let final = '';
                if (folder !== null) {
                    final = "|" + leftPadding(times) + "#" + folder + "\n";
                }
                Promise.all(promarr).then(function (dat) {
                    for (let i in dat) {
                        final = final.concat(dat[i]);
                    }
                    resolve(final.concat(data));
                });
            }
            else {
                resolve(data);
            }
            
            
        }).catch(function (err) {
            reject(err);
        });
    });
}

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

function getPath() {
    return new Promise(function (resolve, reject) {
        models.settings.find({ where: { name: 'path' } }).then(function (path) {
            if (path === null) {
                /*models.settings.create({ name: 'path', value: 'C;Users;Gedas;Downloads' }).then(function (setting) {
                console.log("Path created !");
            }).catch(function (err) {
                console.log("error = " + err);
            });*/
            reject("No path found in db");
            }
            else {
                let tmp = path.value.split(';');
                resolve(tmp.join(pathJS.sep));
            }
        }).catch(function (err) {
            reject(err);
        });

    });
}

function leftPadding(times) {
    let ret = '';
    for (let i = 0; i < times; i++) {
        ret = ret.concat(' ');
    }
    return ret;
}

function fixExtension(ext) {
    return pathJS.extname(ext).substring(1, ext.length);
}

/* GET home page. */
router.get('/', function (req, res) {
    console.log(req);
    //checkUser()
    res.render('index', { title: 'VidsJS', content: 'ziurim ka cia gaunam xD' });
});

router.get('/api/dirlist', function (req, res) {
    getDirListing(0, 1, null).then(function (cont) {
        res.render('index', { title: 'Express', content: cont });
    });
});

router.get('/view/:id', function (req, res) {
    models.items.find({ where: { id: req.params.id } }).then(function (data) {
        //TODO: FIND OUT MAX BUFFER SIZE AND LIMIT BY IT ! ( OR USE MORE BUFFERS ))) )
        //TODO: patikrint ar daliniai grazinimai grazina ka reikia !
        let retrange = function (size) {
            res.set({ 'Content-Range': 'bytes */' + size });
            res.sendStatus(406);
        }
        
        let retchunk = function (range, size, mime, buffer) {
            res.set({ 'Content-Range': 'bytes ' + range + '/' + size });
            res.type(mime);
            res.status(206).send(buffer);
        }

        if (data !== null) {
            let stats = fs.statSync(data.path);
            console.log("range = " + req.get('Range'));
            if (typeof req.get('Range') === 'undefined') {
                retrange(stats.size);
                
            }
            else {                              
                let range = req.get('Range');
                let sp = range.replace('bytes=', '').split('-');
                console.log("splito rezultatas = " + sp);
                let buffer = '';
                let returnrange = '';
                //TODO: LIMIT RANGE TO SOME AMOUNT!
                
                if (sp[0] === '') {
                    // void - number
                    if (parseInt(sp[1]) > stats['size'] || parseInt(sp[1]) < 0) {
                        retrange(stats.size);
                    }
                    //read number of bytes (stats['size'] - parseInt(sp[1]), stats['size'])
                    returnrange = stats['size'] - parseInt(sp[1]) + '-' + parseInt(stats.size) - 1;
                    //let buf = fs.createReadStream(data.path, { start: stats['size'] - parseInt(sp[1]), end: parseInt(stats.size) });
                    /*let fd = fs.openSync(data.path, 'r');
                    fs.read(fd, buffer, 0, (stats['size'] - (stats['size'] - parseInt(sp[1]))), (stats['size'] - parseInt(sp[1])), function (err, bytesRead, buffer) {
                        if (err) {
                            console.log(err);
                            res.send(500);
                        }
                        console.log("buffer length = " + buffer.length);
                        console.log("baitai = " + bytesRead);
                        fs.close(fd);
                        retchunk(returnrange, stats.size, mime.lookup(data.path), buffer);
                    });*/
                    fs.open(data.path, 'r', function (err, fd) {
                        if (err) {
                            console.log("viduj eroras" + err);
                            res.send(500);
                        }
                        let len = parseInt(sp[1]);
                        let buffer = new Buffer(len);
                        fs.read(fd, buffer, 0, len, parseInt(stats.size - parseInt(sp[1])), function (err, bytesRead, buffer) {
                            if (err) {
                                console.log("viduj eroras2" + err);
                                res.send(500);
                            }
                            console.log("baitai = " + bytesRead);
                            fs.close(fd);
                            retchunk(returnrange, stats.size, mime.lookup(data.path), buffer);
                        });
                    });
                    //buf.pipe(buffer);
                    //console.log("buffer length: " + buffer.length);
                }
                else if (sp[1] === '') {
                    // number - void
                    if (parseInt(sp[0]) > stats.size || parseInt(sp[0]) < 0) {
                        retrange(stats.size);
                    }
                    //read number of bytes (parseInt(sp[0]), stats['size'])
                    returnrange = sp[0] + '-' + parseInt(stats.size) - 1;
                    //let buf = fs.createReadStream(data.path, { start: parseInt(sp[0]), end: parseInt(stats.size) });
                   // buf.pipe(buffer);
                    //console.log("buffer length: " + buffer.length);

                    fs.open(data.path, 'r', function (err, fd) {
                        if (err) {
                            console.log("viduj eroras" + err);
                            res.send(500);
                        }
                        let len = parseInt(parseInt(stats.size) - parseInt(sp[0]));
                        let buffer = new Buffer(len);
                        fs.read(fd, buffer, 0, len, parseInt(sp[0]), function (err, bytesRead, buffer) {
                            if (err) {
                                console.log("viduj eroras2" + err);
                                res.send(500);
                            }
                            console.log("baitai = " + bytesRead);
                            fs.close(fd);
                            retchunk(returnrange, stats.size, mime.lookup(data.path), buffer);
                        });
                    });
                }
                else {
                    // number - number
                    if (parseInt(sp[0]) > stats.size || parseInt(sp[0]) < 0) {
                        retrange(stats.size);
                    }
                    else if (parseInt(sp[1]) > stats.size || parseInt(sp[1]) < 0) {
                        retrange(stats.size);
                    }
                    
                    //read range (parseInt(sp[0]), parseInt(sp[1]))
                    returnrange = sp[0] + '-' + sp[1];
                    fs.open(data.path, 'r', function (err, fd) {
                        if (err) {
                            console.log("viduj eroras" + err);
                            res.send(500);
                        }
                        let len = parseInt(parseInt(sp[1]) - parseInt(sp[0]) + 1);
                        let buffer = new Buffer(len);
                        fs.read(fd, buffer, 0, len, parseInt(sp[0]), function (err, bytesRead, buffer) {
                            if (err) {
                                console.log("viduj eroras2" + err);
                                res.send(500);
                            }
                            console.log("baitai = " + bytesRead);
                            fs.close(fd);
                            retchunk(returnrange, stats.size, mime.lookup(data.path), buffer);
                        });
                    });
                }
                /*res.set({ 'Content-Range': 'bytes ' + returnrange + '/' + stats.size });
                res.type(mime.lookup(data.path));
                res.status(206).send(buffer);*/
                //TODO: Check if range is good !
            }
        
        

        
        //Content - Type: video/mp4
        //Content - Range: bytes 0-1023/2048
        //Content-Length: 1024
        }
        else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
        console.log("err = " + err);
        res.sendStatus(500);
    });
});

router.get('/scanDirs', function (req, res) {
    getPath().then(function (path) {
        /*models.settings.create({ name: 'filetypes', value: 'mkv;avi;wmv' }).then(function (setting) {
            console.log("filetypes added !");
        }).catch(function (err) {
            console.log("filetypes adding failed: " + err);
        });*/

        getTypes().then(function (ft) {
            models.items.findAll().then(function (allitems) {
                let cl = new items();
                allitems.map(function (obj) {
                    cl.addItem({ path: obj.path, id: obj.id });
                });
                
                readDir(path, ft, 0, cl).then(function (number) {
                    if (parseInt(number) > 0) {
                        deleteMissingItems(cl).then(function (returned) {
                            if (returned) {
                                res.render('index', { content: number + 'items has been deletered' });
                            }
                            else {
                                res.render('index', { content: 'failed to delete ' + number + ' items' });
                            }
                        });
                    }
                    else {
                        res.render('index', { content: 'list is up to date !' });
                    }
                });
                
            });
                
        }).catch(function (err) {
            console.log("Failed to getType: " + err);
        })        
    }).catch(function (err) {
        console.log("Failed to getPath: " + err);
    });
    
});

module.exports = router;