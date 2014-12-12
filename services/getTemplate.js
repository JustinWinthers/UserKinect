module.exports = function (req, res){

    require('fs').readFile(__dirname + '/../tmpl/' + req.params.template, function(err, data){

        if (err) res.status(500).send(err);

        res.status(200).send(data);

    });

};