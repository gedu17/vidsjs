'use strict';

/*
    * Checks for element in array by comparing paths (used by array.find)
    * element = element value
    * index   = element index in array
    * array   = full element array 
*/
function itemFinder(element, index, array) {
    if (element.path === this.path) {
        return true;
    }
    return false;
}

/*
    * Constructor
*/
function Items() {
    this.items = Array();
}

/*
    * Adds item to array
    * item = item to add (type = { path:'', id: '' })
*/
Items.prototype.addItem = function (item) {
    return new Promise(function (resolve, reject) {

        let i = this.items.findIndex(itemFinder, item);
        if (i > -1) {
            reject("Item " + item.name + " already exists");
        } else {
            this.items.push(item);
            resolve(true);
        }
    });
}

/*
    * Removes item from array
    * item = item to remove (type = { path:'', id: '' })
*/
Items.prototype.removeItem = function (item) {
    var tmp = this;
    return new Promise(function (resolve, reject) {
        let i = tmp.items.findIndex(itemFinder, item);
        
        if (i > -1) {
            let id = tmp.items[i].id;
            tmp.items.splice(i, 1);
            resolve(id);
        }
        else {
            reject("Item " + item.path + " not found.");
        }
    });
}

module.exports = Items;