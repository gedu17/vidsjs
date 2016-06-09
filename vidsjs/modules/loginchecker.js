'use strict';

/*
    * Checks wether user is logged in or not, if not redirects
*/
function loginChecker(req, res, next) {
    let start = req.path.substring(1).split('/');
    if(start[0] !== 'login') {
        if(typeof req.session.uid === "undefined") {
            res.redirect('/login');
        }
        else {
            return next();
        }
    } else {
        return next();
    }
    
}

exports.loginChecker = loginChecker;