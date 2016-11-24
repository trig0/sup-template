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
    }).then(
        function(user) {
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

app.get ('/messages', function(req, res) {
    Message.find(req.query)
    .populate('from')
    .populate('to')
    .then(function(messages){
        // if (err) {
        //     res.status(500).json(messages);
        // }
        res.status(200).json(messages);
        // console.log(req.query);
        });
    });

app.post('/messages', jsonParser, function(req, res){
  // create a message
  console.log('MESSAGE ->',req.body.text);

  Message.create({
    from: req.body.from,
    to: req.body.to,
    text: req.body.text
  }).then(function(message){
    res.status(201).location('/messages/' + message.id).json({});
  });
});
//localhost:8080/messages/aaaaaa
//params = {
//  messageId: aaaaaa
//}
app.get('/messages/:messageId', function(req, res){
  //console.log('MESSAGE ID ->', req.params.messageId);
  Message.findById(req.params.messageId).then(function(message, err){
    //console.log('MESSAGE ->',err, message);
      if (message) {
        User.findById(message.to).then(function(userTo){
          User.findById(message.from).then(function(userFrom){
            var response = {
              text: message.text,
              to: {
                username: userTo.username
              },
              from: {
                username: userFrom.username
              }
            };
            //console.log('RESPONSE ->', response);
            res.status(200).json(response);
          });
        });
    } else {
      res.status(404).json({
        message: 'Message not found'
      });
    }
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
}

exports.app = app;
exports.runServer = runServer;
