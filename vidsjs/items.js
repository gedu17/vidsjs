'use strict';

function itemFinder(element, index, array) {
    //&& parseInt(element.type) === parseInt(this.type)
    if (element.path === this.path) {
        return true;
    }
    return false;
}


function Items() {
    this.items = Array();
}

Items.prototype.addItem = function (item) {
    this.items.push(item);
}

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

/*Items.prototype.length = function () {
    if (typeof this.items === 'undefined') {
        return 0;
    }
    else {
        this.items.length;
    }
    
}*/
module.exports = Items;