module.exports = (function() {
    return function(req, res, next) {

        // determine if this is IISNode or not.  If it's IISNode handling the request
        // then we don't want to present CORS headers as it is handled in IIS web.config
        // if it's via Node then we are simply reflecking the headers
        if (!req.headers.hasOwnProperty('x-iisnode-app_pool_id')) {

            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        }

        next();
    }
})();