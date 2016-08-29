
/*jshint browser: true */
'use strict';
var _ = require('underscore');
var Crafty = require('craftyjs');
var Kono = require('./kono');

var res = require('./res');
var layout = require('./layout');

window.Crafty = Crafty; // DEBUG

var config = {
    selfTile: 'red',
    selfName: 'Player 1',
    enemyTile: 'blue',
    enemyName: 'Player 2',
};

var game = Kono();
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
        .image(image('blueIcon'));

    memo.enemyName = Crafty.e("2D, DOM, Text")
        .attr(layout.enemyName)
        .text(config.enemyName)
        .textFont({size: '50px', family: 'grobedeutschmeister'});

    memo.selfIcon = Crafty.e("2D, DOM, Image")
        .attr(layout.selfIcon)
        .image(image('redIcon'));

    memo.selfName = Crafty.e("2D, DOM, Text")
        .attr(layout.selfName)
        .text(config.selfName)
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

var flashingIcon = function (entities) {
    if (config.selfTile === game.current) {
        flashingImage(entities.selfIcon, config.selfTile + 'Icon');
    } else {
        flashingImage(entities.enemyIcon, config.enemyTile + 'Icon');
    }
};

Crafty.scene('pickFirst', function () {
    var entities = {};
    renderAll(entities);
    flashingIcon(entities);

    _.each(game.listActions(), function (action) {
        var tileEntity = entities[action.from.x + ',' + action.from.y];
        flashingImage(tileEntity, game.at(action.from) + 'Tile');
        tileEntity.requires('Mouse')
            .bind('Click', function () {
                picked = action.from;
                Crafty.scene('pickSecond');
            });
    });
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
                    if (game.result) {
                        Crafty.scene('gameover');
                    } else {
                        picked = null;
                        Crafty.scene('pickFirst');
                    }
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

    if (config.selfTile === game.result) {
        message = config.selfName + ' wins';
    } else {
        message = config.enemyName + ' wins';
    }

    Crafty.e("2D, DOM, Text, Delay")
        .attr(layout.panelText)
        .text(message)
        .textFont({size: '50px', family: 'grobedeutschmeister'})
        .css({'text-align': 'center'})
        .delay(function () {
            game = Kono();
            picked = null;
            Crafty.scene('pickFirst');
        }, 5000);
});

Crafty.load(res, function () {
    console.log("crafty loaded");
    Crafty.init(1024, 768, 'stage');
    Crafty.scene('pickFirst');
});
