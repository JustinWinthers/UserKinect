module.exports = function (req, res) {

    var config = require('./config'), user, password;

    config.env = req.query.env;

    if (req.headers['x-jiraconnect-user'] &&
        req.headers['x-jiraconnect-pwd']){

        user = req.headers['x-jiraconnect-user'];
        password = req.headers['x-jiraconnect-pwd'];

    }

    require('request').get({
            url:config.protocol + '://' + config.env + config.host + '/rest/api/2/project',
            json:true,
            auth:{
                user:user||config.user,
                pass:password||config.password}
        },

        function( err, httpResponse, body ){

            if (err) {
                res.status(500).send('JiraConnect error: getJiraProject' + err);
                return null;
            }

            if (httpResponse.statusCode === 401) {
                res.status(401).send('JiraConnect error: 401 unauthorized');
                return null;
            }

            if (body && body.length && httpResponse.statusCode === 200){
                res.status(200).json(body);
            } else {
                res.status(500).send('JiraConnect error: get JiraUser, body not array');
            }

            return null;
        });
};