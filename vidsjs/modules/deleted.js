'use strict';

var models = require('../models');

/*
    * Flags item as deleted by user
    * res = Response object from expressjs
    * id  = Id of the item to be flagged
*/
//TODO: check if the user id matches
function deleted(res, id) {
    models.virtual_items.find({ where: { id: id } }).then(function (item) {
        if (item === null) {
            //TODO: add message to s_m
            res.sendStatus(404);
        } else {
            models.virtual_items.update({ deleted: 1 }, {where: {id: id}, limit: 1});
            res.redirect('/');
        }
    });
}

exports.deleted = deleted;
