module.exports = function (app) {

    //quick test to ensure NodeIIS and Windows auth are working
    app.get('/testauth', function (req, res) {

        console.log(req);

        var userName = req.headers['x-iisnode-auth_user'].replace('NRECA\\','');
        var logonUser = req.headers['x-iisnode-logon_user'].replace('NRECA\\','');
        var authenticationType = req.headers['x-iisnode-auth_type'];

        res.send('credentials: ' + userName + ' , ' + logonUser + ' , ' + authenticationType);

    });

    //to get iisnode headers access: req.headers['x-iisnode-auth_user'].replace('NRECA\\','');


};