module.exports = function(req,res){

    var JiraApi = require('jira').JiraApi
        ,img = req.body.image.replace(/^data:image\/\w+;base64,/, "").replace(/\s/g, "+")
        ,request = require('request')
        ,fs = require('fs')
        ,location = '\n\nURL where issue was identified: ' + req.body.location || 'None reported'
        ,issue = {
            fields: {
                project:{key:req.body.project},
                issuetype:{name:req.body.issueType},
                summary:req.body.summary,
                description:req.body.description + location,
                components:[{name:req.body.component}],
                reporter:{name:req.body.username}
                //assignee:{name:req.body.username}
            }
        }
        ,config = require('./config');

    config.env = req.body.env;

    var jira = new JiraApi(config.protocol, config.env + config.host, config.port, config.user, config.password, config.apiVersion);

    jira.addNewIssue( issue, function(error, data){

        if (error){
            console.log ("error: ", error);
            res.status(500).send(error);
        }

        request.post({
                url:config.protocol + '://' + config.env + config.host + '/rest/api/2/issue/' + data.key + '/attachments',
                auth:{
                    user:'jew1',
                    pass:'Logan1000'},
                headers: {
                    'X-Atlassian-Token': 'nocheck'
                },
                formData: {
                    file:{
                        value: new Buffer(img, 'base64'),
                        options: {
                            filename: 'image.png',
                            contentType: 'image/png'
                        }
                    }}
            },

            function( err, httpResponse, body ){

                if (err) {
                    console.log ('Jira error create new issue: ', err);
                    res.status(500).send(err);
                    return null;
                }

                if (httpResponse.statusCode === 401) {
                    res.status(401).send('JiraConnect error: 401 unauthorized');
                    return null;
                }

                res.status(200).send(data);

                return null;

            });

    });

};