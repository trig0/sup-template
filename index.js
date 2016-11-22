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

app.post('/users', jsonParser, function(req, res){
  
        if (!req.body.username) {
            return res.status(422).json({
            message: 'Missing field: username'});
        }
        else if (typeof req.body.username !== 'string') {
            return res.status(422).json({
            message: 'Incorrect field type: username'});
        };

 
    User.create({username: req.body.username}, function(err, user){

        if (err) {
            console.error('You have created an error');

        }

        res.status(201).location('/users/' + user._id).json({});
        });
});

app.get('/users/:userId', jsonParser, function(req, res){

    
    User.findOne({_id: req.params.userId}).then(
        function(user){
            if(!user) {
                 res.status(404).send({
                    message: 'User not found'
                });
                 return;
            }
            // console.log(User._id;
         res.status(200).json(user);    
  
    }).catch(function(err) {
                 res.status(500).send({
                    message: 'Internal Server Error'
                });
    })
    
});

// app.put('/items:username', function(req, res) {

// }

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

