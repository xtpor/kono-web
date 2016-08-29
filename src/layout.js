
'use strict';
var _ = require('underscore');


var rawPosition = {
    "screen": [0, 0, 1024, 768],
    "enemyIcon": [50, 648, 70, 70],
    "enemyName": [140, 648, 300, 70],
    "selfIcon": [904, 50, 70, 70],
    "selfName": [583, 50, 300, 70],
    "board": [312, 184, 400, 400],
    "panel": [197, 284, 630, 200],
    "panelText": [287, 346, 450, 75],
    "grid:0,0": [324, 496, 75, 75],
    "grid:0,1": [324, 396, 75, 75],
    "grid:0,2": [324, 296, 75, 75],
    "grid:0,3": [324, 196, 75, 75],
    "grid:1,0": [424, 496, 75, 75],
    "grid:1,1": [424, 396, 75, 75],
    "grid:1,2": [424, 296, 75, 75],
    "grid:1,3": [424, 196, 75, 75],
    "grid:2,0": [524, 496, 75, 75],
    "grid:2,1": [524, 396, 75, 75],
    "grid:2,2": [524, 296, 75, 75],
    "grid:2,3": [524, 196, 75, 75],
    "grid:3,0": [624, 496, 75, 75],
    "grid:3,1": [624, 396, 75, 75],
    "grid:3,2": [624, 296, 75, 75],
    "grid:3,3": [624, 196, 75, 75],
};

var screenHeight = rawPosition.screen[3];

module.exports = _.object(_.map(rawPosition, function (pos, name) {
    return [name, {
        x: pos[0],
        y: screenHeight - pos[1] - pos[3],
        w: pos[2],
    h: pos[3]}];
}));
