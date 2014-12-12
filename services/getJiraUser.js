module.exports = function (req, res) {

    var config = require('./config');

    config.env = req.query.env;

    require('request').get({
            url:config.protocol + '://' + config.env + config.host + '/rest/api/2/user/assignable/search?project=' + req.query.project + '&username=' + req.query.username,
            json:true,
            auth:{
                user:config.user,
                pass:config.password}
        },

        function( err, httpResponse, body ){

            if (err) {
                res.status(500).send('JiraConnect error: getJiraUser' + err);
                return null;
            }

            if (httpResponse.statusCode === 401) {
                res.status(401).send('JiraConnect error: 401 unauthorized');
                return null;
            }

            if (body && body.length){
                res.status(200).json({
                    key:body[0].hasOwnProperty('key') ? body[0].key : '',
                    displayName:body[0].hasOwnProperty('displayName') ? body[0].displayName : '',
                    avatarUrl:body[0].hasOwnProperty('avatarUrls') ? body[0].avatarUrls['48x48'] : 'http://localhost:8888/avatar.png'
                })
            } else {
                res.status(500).send('JiraConnect error: get JiraUser, body not array');
            }

            return null;
        });
};