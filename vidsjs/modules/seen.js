'use strict';

var models = require('../models');

/*
    * Flags item as seen by user
    * res = response object from expressjs
    * id  = id of the item to be flagged 
*/
//FIXME: user id 
//FIXME: use users_data table instead of items
function seen(res, id) {
    models.items.find({ where: { id: id } }).then(function (data) {
        if (data !== null) {
            models.users_data.find({ where: { user: 1, item: id } }).then(function (item) {
                if (item === null) {
                    models.users_data.create({ user: 1, item: id, data: 'test' });
                    res.redirect('/');
                } else {
                    res.redirect('/');
                }
            }); 
        } else {
            res.sendStatus(404);
        }
    });
}

exports.seen = seen;