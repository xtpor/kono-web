
/*jshint browser: true */
'use strict';
var _ = require('underscore');
var client = require('socket.io-client');
var Crafty = require('craftyjs');

var kono = require('./src/kono');
var res = require('./src/res');
var layout = require('./src/layout');


var gamemeta = {
    selfTile: '',
    selfName: '',
    enemyTile: '',
    enemyName: '',
};

var socket;
var game = kono();
var picked = null;


var image = function (imageName) {
    return 'assets/images/' + imageName + '.png';
};

var flashingImage = function (entity, imageName) {
    var emphasized = true;
    entity.requires('Image, Delay')
        .image(image(imageName + 'Em'))
        .delay(function () {
            if (emphasized) {
                this.image(image(imageName + 'Em'));
            } else {
                this.image(image(imageName));
            }
            emphasized = !emphasized;
        }, 400, -1);
};

var renderAll = function (memo) {
    memo.enemyIcon = Crafty.e("2D, DOM, Image")
        .attr(layout.enemyIcon)
        .image(image(gamemeta.enemyTile + 'Icon'));

    memo.enemyName = Crafty.e("2D, DOM, Text")
        .attr(layout.enemyName)
        .text(gamemeta.enemyName)
        .textFont({size: '50px', family: 'grobedeutschmeister'});

    memo.selfIcon = Crafty.e("2D, DOM, Image")
        .attr(layout.selfIcon)
        .image(image(gamemeta.selfTile + 'Icon'));

    memo.selfName = Crafty.e("2D, DOM, Text")
        .attr(layout.selfName)
        .text(gamemeta.selfName)
        .textFont({size: '50px', family: 'grobedeutschmeister'})
        .css({'text-align': 'right'});

    memo.board = Crafty.e("2D, DOM, Image")
        .attr(layout.board)
        .image(image('board'));

    _.times(4, function (i) {
        _.times(4, function (j) {
            var tile = game.at({x: i, y: j});
            memo[i + ',' + j] = Crafty.e("2D, DOM, Image")
                .attr(layout['grid:' + i + ',' + j])
                .image(image(tile + 'Tile'));
        });
    });
};

var renderPanel = function (entities) {
    entities.panel = Crafty.e("2D, DOM, Image")
        .attr(layout.panel)
        .image('assets/images/panel.png');

    entities.message = Crafty.e("2D, DOM, Text, Delay")
        .attr(layout.panelText)
        .text('')
        .textFont({size: '50px', family: 'grobedeutschmeister'})
        .css({'text-align': 'center'});
};

var flashingIcon = function (entities) {
    if (gamemeta.selfTile === game.current) {
        flashingImage(entities.selfIcon, gamemeta.selfTile + 'Icon');
    } else {
        flashingImage(entities.enemyIcon, gamemeta.enemyTile + 'Icon');
    }
};

var sceneDispatch = function () {
    if (game.result) {
        Crafty.scene('gameover');
    } else {
        picked = null;
        Crafty.scene('pickFirst');
    }
};

Crafty.scene('disconnected', function () {
    var entities = {};
    renderPanel(entities);
    entities.message.text('connecting');
});

Crafty.scene('naming', function () {
    var keysTable = _.invert(Crafty.keys);
    var name = '';
    var entities = {};
    renderPanel(entities);
    entities.message.requires('Keyboard')
        .text("What's your name")
        .bind('KeyDown', function (e) {
            var key = keysTable[e.key];
            if (name.length > 0 && key === 'BACKSPACE') {
                name = name.slice(0, -1);
            } else if (key.match(/^[A-Z0-9]$/)) {
                name += key.toLowerCase();
            } else if (key === 'SPACE') {
                name += ' ';
            }
            this.text('> ' + name + ' <');
        })
        .bind('KeyDown', function (e) {
            if (e.key === Crafty.keys.ENTER) {
                socket.emit('queueup', {nickname: name});
                Crafty.scene('matching');
            }
        });
});

Crafty.scene('matching', function () {
    var entities = {};
    renderPanel(entities);
    entities.message.text('connecting');
});

Crafty.scene('pickFirst', function () {
    var entities = {};
    renderAll(entities);
    flashingIcon(entities);

    if (gamemeta.selfTile === game.current) {
        _.each(game.listActions(), function (action) {
            var tileEntity = entities[action.from.x + ',' + action.from.y];
            flashingImage(tileEntity, game.at(action.from) + 'Tile');
            tileEntity.requires('Mouse')
                .bind('Click', function () {
                    picked = action.from;
                    Crafty.scene('pickSecond');
                });
        });
    }
});

Crafty.scene('pickSecond', function () {
    var entities = {};
    renderAll(entities);
    flashingIcon(entities);

    _.each(game.listActions(), function (action) {
        if (_.isEqual(picked, action.from)) {
            var tileEntity = entities[action.to.x + ',' + action.to.y];
            flashingImage(tileEntity, game.at(action.to) + 'Tile');
            tileEntity.requires('Mouse')
                .bind('Click', function () {
                    game.act(action);
                    socket.emit('action', action);
                    sceneDispatch();
                });
        }
    });

    var pickedEntity = entities[picked.x + ',' + picked.y];
    pickedEntity.requires('Mouse')
        .image(image(game.at(picked) + 'TileEm'))
        .bind('Click', function () {
            picked = null;
            Crafty.scene('pickFirst');
        });
});

Crafty.scene('gameover', function () {
    var entities = {};
    renderAll(entities);

    Crafty.e("2D, DOM, Image")
        .attr(layout.panel)
        .image('assets/images/panel.png');

    var message;

    if (gamemeta.selfTile === game.result) {
        message = gamemeta.selfName + ' wins';
    } else {
        message = gamemeta.enemyName + ' wins';
    }

    Crafty.e("2D, DOM, Text, Delay")
        .attr(layout.panelText)
        .text(message)
        .textFont({size: '50px', family: 'grobedeutschmeister'})
        .css({'text-align': 'center'})
        .delay(function () {
            game = kono();
            picked = null;
            Crafty.scene('pickFirst');
        }, 5000);
});

Crafty.load(res, function () {
    Crafty.init(1024, 768, 'stage');
    Crafty.scene('disconnected');

    socket = client();

    socket.on('connect', function () {
        Crafty.scene('naming');
    });

    socket.on('start', function (payload) {
        gamemeta = payload;
        sceneDispatch();
    });

    socket.on('action', function (payload) {
        game.act(payload);
        sceneDispatch();
    });

    socket.on('disconnect', function () {
        Crafty.scene('disconnected');
    });
});
