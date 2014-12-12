var express = require('express'),
    app = express(),
    port = process.env.PORT || 8888,
    bodyParser = require('body-parser'),
    path = require('path'),
    server = require('http').Server(app),
    cors = require('./services/allowCors.js');

//Middleware
app.use(bodyParser({limit: '50mb'}));
app.use(express.static(__dirname + '/www'));
app.use(cors);

//Routes
require('./routes/userKinectApi.js')(app);
require('./routes/testauth.js')(app);

server.listen(port);
console.log('Server listening on port ' + port);