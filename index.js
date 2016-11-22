var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

var jsonParser = bodyParser.json();

var User = require('./models/user');

// Add your API endpoints here

app.get('/users', function(req, res) {
    User.find(function(err, users){
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(200).json(users);
    });
});

app.post('/users', function(req, res){
    console.log('username: ' + User.username);
    User.create(function(err, username){
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        if (!username) {
            console.error("No User", username);
            mongoose.disconnect();
            return;
        }
        if (typeof username !== 'String') {
            console.error("User must be text", username);
            mongoose.disconnect();
            return;
        }
        res.status(201).json(users);
    });
});

var runServer = function(callback) {
    var databaseUri = process.env.DATABASE_URI || global.databaseUri || 'mongodb://demo:demo@ds159497.mlab.com:59497/mlab';
    mongoose.connect(databaseUri).then(function() {
        var port = process.env.PORT || 8080;
        var server = app.listen(port, function() {
            console.log('Listening on port ' + port);
            if (callback) {
                callback(server);
            }
        });
    });
};

if (require.main === module) {
    runServer();
};

exports.app = app;
exports.runServer = runServer;

