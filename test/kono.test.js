
/* mocha globals */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';
var Kono = require('../src/kono');
var expect = require('chai').expect;


var act = function (game, fromX, fromY, toX, toY) {
    game.act({
        from: {x: fromX, y: fromY},
        to: {x: toX, y: toY}
    });
};

describe('Kono', function () {
    it('simulation #1', function () {
        var game = Kono();

        act(game, 3, 3, 3, 1);
        act(game, 1, 1, 3, 1);
        act(game, 2, 3, 2, 1);
        act(game, 0, 0, 0, 2);
        act(game, 2, 2, 0, 2);

        act(game, 3, 0, 3, 2);
        act(game, 0, 2, 3, 2);
        act(game, 1, 0, 0, 0);
        act(game, 1, 2, 1, 1);
        act(game, 0, 0, 0, 3);

        act(game, 2, 1, 0, 1);
        act(game, 3, 1, 3, 0);
        act(game, 1, 3, 1, 2);
        act(game, 0, 3, 0, 2);
        act(game, 3, 2, 2, 2);

        act(game, 0, 2, 0, 3);
        act(game, 2, 2, 2, 3);
        act(game, 0, 3, 0, 2);
        act(game, 2, 3, 1, 3);
        act(game, 0, 2, 0, 3);

        act(game, 0, 1, 0, 2);
        act(game, 2, 0, 2, 1);
        act(game, 1, 1, 0, 1);
        act(game, 3, 0, 3, 1);
        act(game, 0, 1, 0, 3);

        act(game, 2, 1, 2, 0);
        act(game, 1, 2, 2, 2);
        act(game, 3, 1, 2, 1);
        act(game, 1, 3, 1, 2);
        act(game, 2, 0, 2, 2);

        act(game, 0, 2, 2, 2);
        
        expect(game.listActions()).to.be.eql([]);
        expect(game.result).to.be.equal('red');
    });
});
