var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

var jsonParser = bodyParser.json();

var User = require('./models/user');

var Message = require('./models/message');

// Add your API endpoints here

app.get('/users', function(req, res) {
    User.find(function(err, users) {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(200).json(users);
    });
});

app.post('/users', jsonParser, function(req, res) {

    if (!req.body.username) {
        return res.status(422).json({
            message: 'Missing field: username'
        });
    } else if (typeof req.body.username !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: username'
        });
    };


    User.create({
        username: req.body.username
    }, function(err, user) {

        if (err) {
            console.error('You have created an error');

        }

        res.status(201).location('/users/' + user._id).json({});
    });
});

app.get('/users/:userId', jsonParser, function(req, res) {


    User.findOne({
        _id: req.params.userId
    }).then(function(user) {
        if (!user) {
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

app.put('/users/:userId', jsonParser, function(req, res) {

    if (!req.body) {
        return res.status(400).json({
            message: 'No request body'
        });
    }
    if (!('username' in req.body)) {
        return res.status(422).json({
            message: 'Missing field: username'
        });
    }
    if (typeof req.body.username !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: username'
        });
    }

    User.findOneAndUpdate({
        _id: req.params.userId
    }, {
        username: req.body.username
    }, {
        upsert: true
    }).then(function(user) {
        res.status(200).json({});
    }).catch(function(err) {
        console.log(err);
        res.status(500).send({
            message: 'Internal Server Error'
        });
    });
});


app.delete('/users/:userId', jsonParser, function(req, res) {

    User.findOneAndRemove({
        _id: req.params.userId
    }).then(
        function(user) {
            if (!user) {
                res.status(404).json({
                    message: 'User not found'
                });
                return;
            }
            // console.log(User._id);
            res.status(200).json({});

        }).catch(function(err) {
        res.status(500).send({
            message: 'Internal Server Error'
        });
    });
});

//messages endpoints here

app.get('/messages', function(req, res) {
    Message.find(req.query)
        .populate('from')
        .populate('to')
        .then(function(messages) {
            // if (err) {
            //     res.status(500).json(messages);
            // }
            res.status(200).json(messages);
            // console.log(req.query);
        });
});

app.post('/messages', jsonParser, function(req, res) {
    // create a message
    // console.log(req.body);
    if (!req.body.text) {
        return res.status(422).send({
            message: 'Missing field: text'
        });
    }
    if (typeof req.body.text !== 'string') {
        return res.status(422).send({
            message: 'Incorrect field type: text'
        });
    }
    if (typeof req.body.to !== 'string') {
        return res.status(422).send({
            message: 'Incorrect field type: to'
        });
    }
    if (typeof req.body.from !== 'string') {
        return res.status(422).send({
            message: 'Incorrect field type: from'
        });
    }
    // User.findOne(req.body.from) {
    
    // }
    //     .then(function(user){
    //         console.log(user);
    //     });
    //     console.log(req.body.from);
    //     return res.status(422).send({
    //         message: 'Incorrect field value: from'
    //     });   
    Message.create(req.body).then(function(message) {
        res.status(201).location('/messages/' + message._id).json({});
    });
});

// app.get('messages/:messageId', jsonParser, function(req, res) {

//     Message.findOne({text: req.params.text
//     }).then(function(message) {
//         res.status(201).json(message)
//     }.catch(function(err) {
//         res.status(404).send({
//             message: 'Message not found'
//         });
//     }));
// });

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
}

exports.app = app;
exports.runServer = runServer;