module.exports = function (req, res){

    var fs = require('fs')
        ,minify = require('minify')
        ,config = require('./config');

    fs.readFile (__dirname + '/../dist/userKinect.js', function(err, data){

        if (err) throw err;

        var data = data.toString().replace(/{project}/g, req.query.project || null);
        data = data.toString().replace(/{issueType}/g, req.query.issuetype || null);
        data = data.toString().replace(/{component}/g, req.query.component || '');
        data = data.toString().replace(/{mode}/g, req.query.mode || 'limited');

        data = data.replace(/{host}/g, req.protocol + '://' + req.get('host') );

        if (typeof req.query.env==='string') {
            if (req.query.env.toUpperCase() === 'PROD') {
                data = data.replace(/{jira_env}/g, '');
            } else {
                data = data.replace(/{jira_env}/g, 'test');
            }
        } else {
            data = data.replace(/{jira_env}/g, 'test');
        }

        if (config.minify) {

            minify({
                ext: '.js',
                data: data
            }, function(err, data) {

                if (err) throw err;

                getJiraConnectJS(data);

            });

        } else {

            getJiraConnectJS(data);

        }

    });

    function getJiraConnectJS(data){
        fs.readFile (__dirname + '/../dist/comments.js', function(err, comments){

            if (err) throw err;

            //get html2canvas
            fs.readFile (__dirname + '/../bower_components/html2canvas/build/html2canvas.min.js',
                function(err, html2canvas){

                    if (err) throw err;

                    res.setHeader("Content-Type", "text/javascript");
                    res.status(200).send(comments + '\n' + data + '\n' + html2canvas);

                });
        })
    }

};