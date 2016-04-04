'use strict';
var models = require('../models');
var express = require('express');
var jade = require('jade');
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

function compareDirListing2(a, b) {
    if (a.type === 1 && b.type === 1) {
        return a.name.localeCompare(b.name);
    } else if (a.type === 1 && b.type === 0 || a.type === 0 && b.type === 1) {
        return 1;
    } else {
        return a.name.localeCompare(b.name);
    }
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
    let itemarr = {name:"parentDir", type: 0, items: Array()};
    return new Promise(function (resolve, reject) {
        models.items.findAll({ where: { parent: level }, order: 'type ASC, name ASC' }).then(function (items) {
            let promarr = Array();
            if (folder !== null) {
                itemarr = { name: folder, type: 0, items: Array() };
            }

            for (let i in items) {
                if (items[i].type === 0) {
                    promarr.push(getDirListing(items[i].id, times + 1, items[i].name));
                }
                else {
                    itemarr.items.push({ name: items[i].name, type: 1, url: '/view/'+items[i].id});
                }
            }
            
            if (promarr.length > 0) {
                Promise.all(promarr).then(function (dat) {
                    for (let i in dat) {
                        dat[i].items.sort(compareDirListing2);
                        itemarr.items.push(dat[i]);
                    }
                    resolve(itemarr);
                });
            }
            else {
                resolve(itemarr);
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
        ret = ret.concat('    ');
    }
    return ret;
}

function fixExtension(ext) {
    return pathJS.extname(ext).substring(1, ext.length);
}

function getUserDefinedName(id) {
    //TODO: IMPLEMENT
    return new Promise(function (resolve, reject) {
        models.items.find({ where: { id: id } }).then(function (data) {
            resolve(pathJS.basename(data.path));
        }).catch(function (err) {
            reject(err);
        });
    });
    
    
}

/* GET home page. */
router.get('/', function (req, res) {
    //console.log(req);
    //checkUser()
    //res.render('index', { title: 'VidsJS', content: 'ziurim ka cia gaunam xD' });
    getDirListing(0, 1, null).then(function (cont) {
        
        cont.items.sort(compareDirListing2);
        res.render('dirlist', { content: cont });
    }).catch(function (err) {
        console.log(err);
    });
});

router.get('/api/dirlist', function (req, res) {
    getDirListing(0, 1, null).then(function (cont) {

        cont.items.sort(compareDirListing2);
        res.render('dirlist', { content: cont });
    }).catch(function (err) {
        console.log(err);
    });
});

router.get('/view/:id', function (req, res) {
    models.items.find({ where: { id: req.params.id } }).then(function (data) {
        //TODO: FIND OUT MAX BUFFER SIZE AND LIMIT BY IT ! ( OR USE MORE BUFFERS ))) ) // 1gb xdd
        let stats = fs.statSync(data.path);
        let returnrange = '';
        

        let returnData = function (file, length, start, range, size, id) {

            let crs = fs.createReadStream(file, { flags: "r", start: start, end: start + length });
            res.set({ 'Content-Range': 'bytes ' + range + '/' + size });
            res.set({ 'Content-Length': length });
            getUserDefinedName(id).then(function (name) {
                res.set({ 'Content-Disposition': 'inline; filename="' + name + '"' });
                res.type(mime.lookup(file)).status(206);
                crs.pipe(res);
            }).catch(function (err) {
                console.log("returndata err: " + err);
            });
        }
        

        let retrange = function (size) {
            res.set({ 'Content-Range': 'bytes */' + size });
            res.sendStatus(416);
        }      

        if (data !== null) {
            //let stats = fs.statSync(data.path);
            if (typeof req.get('Range') === 'undefined') {
                //10ish mb
                let sizeconst = 10000000;
                if (stats.size > sizeconst) {
                    returnrange = '0-' + (sizeconst - 1);
                    returnData(data.path, sizeconst, 0, returnrange, stats.size, data.id);
                }
                else {
                    returnrange = '0-' + (stats.size - 1);
                    returnData(data.path, stats.size, 0, returnrange, stats.size, data.id);
                }
               
            }
            else {                              
                let sp = req.get('Range').replace('bytes=', '').split('-');
                
                //TODO: LIMIT RANGE TO SOME AMOUNT!
                
                if (sp[0] === '') {
                    // void - number
                    if (parseInt(sp[1]) > stats.size || parseInt(sp[1]) <= 0) {
                        retrange(stats.size);
                    }
                    else {
                        returnrange = (stats.size - parseInt(sp[1])) + '-' + (parseInt(stats.size) - 1);
                        returnData(data.path, parseInt(sp[1]), parseInt(stats.size - parseInt(sp[1])), returnrange, stats.size, data.id);
                    }
                }
                else if (sp[1] === '') {
                    // number - void
                    if (parseInt(sp[0]) > stats.size || parseInt(sp[0]) < 0) {
                        retrange(stats.size);
                    }
                    else {
                        returnrange = parseInt(sp[0]) + '-' + (parseInt(stats.size) - 1);
                        returnData(data.path, parseInt(parseInt(stats.size) - parseInt(sp[0])), parseInt(sp[0]), returnrange, stats.size, data.id);
                    }
                }
                else {
                    // number - number
                    if (parseInt(sp[0]) > stats.size || parseInt(sp[0]) < 0) {
                        retrange(stats.size);
                    }
                    else if (parseInt(sp[1]) > stats.size || parseInt(sp[1]) < 0) {
                        retrange(stats.size);
                    }
                    else {
                        returnrange = sp[0] + '-' + sp[1];
                        returnData(data.path, parseInt(parseInt(sp[1]) - parseInt(sp[0]) + 1), parseInt(sp[0]), returnrange, stats.size, data.id);
                    }
                }
            }
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