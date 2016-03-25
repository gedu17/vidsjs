'use strict';
var models = require('../models');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pathJS = require('path');
var Sequelize = require('sequelize');
var filetypes = Array();

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

function readDir(path, ft, level) {
    //console.log("Path: " + path + " ; Level: " + level);
    console.log("^ " + path);
    path += pathJS.sep;
    let data = fs.readdirSync(path);
    for (let i in data) {
        let newPath = path.concat(data[i]);
        let stats = fs.statSync(newPath);

        if (stats.isDirectory()) {
            let newlevel = 0;
            models.items.find({ where: { name: data[i], parent: level } }).then(function (item) {
                if (item === null) {
                    models.items.create({ name: data[i], parent: level, type: 0 }).then(function (createditem) {
                        newlevel = createditem.id;
                    });
                    console.log('+^ ' + data[i]);
                }
                else {
                    newlevel = item.id;
                    console.log('*^ ' + data[i]);
                }
                console.log("Lygis bus = " + newlevel);
                readDir(newPath, ft, newlevel);
            }).catch(function (err) {
                console.log("l2p " + err);
            });
            //let tmp = level+1;
            //readDir(newPath, tmp);
            
        }
        else {

            if (checkType(fixExtension(data[i]), ft)) {
                models.items.find({ where: { name: data[i], parent: level } }).then(function (item) {
                    if (item === null) {
                        models.items.create({ name: data[i], parent: level, type: 1 });
                        console.log('+. ' + data[i]);
                    }
                    else {
                        console.log('*. ' + data[i]);
                    }
                });
            }
            else {
                console.log('-. ' + data[i]);
            }
            
        }
    }
}

var getTypes = new Promise(function (resolve, reject) {
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
})

var getPath = new Promise(function (resolve, reject) {
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

function fixExtension(ext) {
    return pathJS.extname(ext).substring(1, ext.length);
}

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

router.get('/scanDirs', function (req, res) {
    getPath.then(function (path) {
        /*models.settings.create({ name: 'filetypes', value: 'mkv;avi;wmv' }).then(function (setting) {
            console.log("filetypes added !");
        }).catch(function (err) {
            console.log("filetypes adding failed: " + err);
        });*/

        filetypes = getTypes.then(function (ft) {
            readDir(path, ft, 0);
        }).catch(function (err) {
            console.log("Failed to getType: " + err);
        })        
    }).catch(function (err) {
        console.log("Failed to getPath: " + err);
    });
        //pathJS.join("C:", "Users", "Gedas", "Downloads");
    /*orm.db.sync(function (err) {
        if (err)
            throw err;
        var tmp = settings.findAll({ where: { name: 'path' } }).then(function (setting) {
        console.log(setting);
        console.log("setting name = " + setting.name);
        console.log("setting value = " + setting.value);
    }).catch(function (err) {
        console.log("err is " + err);    
    });
            //path = data[0].value;
            //console.log("data = " + data);

console.log(tmp);*/
    //});
    //readDir(path, 1);
    res.render('index', { content: 'Dir listing updatedered' });
});

module.exports = router;