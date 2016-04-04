'use strict';

var pathJS = require('path');
var models = require('../models');
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
    * Fetches video root directory
*/
//TODO: Implement an ability to use more than one root directory
function getPath() {
    return new Promise(function (resolve, reject) {
        models.settings.find({ where: { name: 'path' } }).then(function (path) {
            if (path === null) {
                reject("No path found in db");
            }
            else {
                let tmp = path.value.split(';');
                resolve(tmp.join(pathJS.sep));
            }
        }).catch(function (err) {
            reject("get path: " + err);
        });
    });
}

/*
    * Returns the file extension and removes the dot from extension name
    * file = file name with extension
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
    } else if (a.type === 1 && b.type === 0 || a.type === 0 && b.type === 1) {
        return 1;
    } else {
        return a.name.localeCompare(b.name);
    }
}

/*
    * Returns link to a video
    * id = id of the video in database
*/

//FIXME: implement
function generateViewUrl(id) {
    return '/view/' + id;
}

exports.getTypes = getTypes;
exports.getPath = getPath;
exports.fixExtension = fixExtension;
exports.compareDirListing = compareDirListing;
exports.generateViewUrl = generateViewUrl;
//module.exports = [getTypes, getPath, fixExtension, compareDirListing, generateViewUrl];