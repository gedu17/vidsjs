'use strict';

/*
    * Checks wether user is logged in or not, if not redirects
    * Ignores view route as it is most likely accessed by some program that is not the browser
*/
function loginChecker(req, res, next) {
    let start = req.path.substring(1).split('/');
    if(start[0] !== 'login' && start[0] !== 'view') {
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