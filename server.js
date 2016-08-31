
'use strict';
var path = require('path');
var express = require('express');
var socketio = require('socket.io');
var _ = require('underscore');

var serverPort = 8000;
var publicDir = __dirname + '/public';
var mainPage = path.resolve(publicDir + '/index.html');

var app = express();
var server = app.listen(serverPort);
var io = socketio.listen(server);

app.use(function (req, res, next) {
    console.log(req.ip, '=>', req.url);
    next();
});

app.get('/', function (req, res) {
    res.sendFile(mainPage);
});

app.use(express.static(publicDir));


var queue = [];

var matchmaking = function () {
    while (queue.length >= 2) {
        var tiles = _.shuffle(['red', 'blue']);
        var first = queue.shift();
        var second = queue.shift();

        first.state = 'playing';
        first.tile = tiles[0];
        first.oppsite = second;
        second.state = 'playing';
        second.tile = tiles[1];
        second.oppsite = first;

        _.each([first, second], function (player) {
            player.emit('start', {
                selfTile: player.tile,
                selfName: player.nickname,
                enemyTile: player.oppsite.tile,
                enemyName: player.oppsite.nickname,
            });
        });

        console.log('Matched ' + first.nickname + ' vs ' + second.nickname);
    }
};

io.on('connection', function (socket) {

    socket.state = 'idling';
    socket.nickname = '';
    socket.oppsite = null;
    socket.tile = null;

    socket.on('queueup', function (payload) {
        if (socket.state === 'idling') {
            socket.state = 'matching';
            socket.nickname = payload.nickname;
            queue.push(socket);
            console.log('Player ' + socket.nickname + ' enters the queue.');
            matchmaking();
        }
    });

    socket.on('action', function (payload) {
        if (socket.state === 'playing') {
            socket.oppsite.emit('action', payload);
        }
    });

    socket.on('disconnect', function () {
        if (socket.state === 'matching') {
            queue.splice(queue.indexOf(socket), 1);
            console.log('Player ' + socket.nickname + ' exits the queue.');
        }
        if (socket.state !== 'idling') {
            console.log('Player ' + socket.nickname + ' disconnected');
        }
    });

});

console.log('hosting kono at port ' + serverPort);
