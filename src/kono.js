
'use strict';
var expect = require('chai').expect;
var _ = require('underscore');


var fmap = function (value, f) {
    // fmap (Maybe monad)
    // if value is no undefined, apply the function `f` and return the result.
    // Otherwise, returns undefined.
    if (value !== undefined) {
        return f(value);
    }
};

var pointGuard = function (point) {
    if (0 <= point.x && point.x < 4 && 0 <= point.y && point.y < 4) {
        return point;
    }
};

var validatePoint = function (point) {
    expect(point).to.be.contain.all.keys('x', 'y');
    expect(point).to.be.satisfy(function (p) {
        return ~~point.x === point.x && ~~point.y === point.y && pointGuard(p);
    });
};

var up = function (point) {
    return fmap(point, function (p) {
        return pointGuard({x: p.x, y: p.y - 1});
    });
};

var down = function (point) {
    return fmap(point, function (p) {
        return pointGuard({x: p.x, y: p.y + 1});
    });
};

var left = function (point) {
    return fmap(point, function (p) {
        return pointGuard({x: p.x - 1, y: p.y});
    });
};

var right = function (point) {
    return fmap(point, function (p) {
        return pointGuard({x: p.x + 1, y: p.y});
    });
};

var oppsite = function (tile) {
    if (tile === 'red') {
        return 'blue';
    } else if (tile === 'blue') {
        return 'red';
    } else {
        return 'empty';
    }
};

var mapPoints = function (cb) {
    var collector = [];
    _.times(4, function (x) {
        _.times(4, function (y) {
            collector.push(cb({x: x, y: y}));
        });
    });
    return collector;
};

var Game = module.exports = function (spec) {
    var that = {};

    /* public fields */
    that.result = undefined;
    that.current = 'red';

    /* private fields */
    var board = _.times(4, function (x) {
        return _.times(4, function (y) {
            if (y < 2) {
                return 'red';
            } else {
                return 'blue';
            }
        });
    });

    /* public methods */
    that.at = function (point) {
        validatePoint(point);
        return board[point.x][point.y];
    };

    that.listActions = function () {
        if (that.result) {
            return [];
        } else {
            var nestedActions = _.map([up, down, left, right], function (next) {
                return mapPoints(function (p) {
                    return [
                        testMove(p, next),
                        testAttackFar(p, next),
                        testAttackClose(p, next),
                    ];
                });
            });
            return _.compact(_.flatten(nestedActions));
        }
    };

    that.act = function (action) {
        expect(that.listActions()).to.deep.include.members([action]);
        board[action.to.x][action.to.y] = board[action.from.x][action.from.y];
        board[action.from.x][action.from.y] = 'empty';
        that.current = oppsite(that.current);

        if (_.isEmpty(that.listActions())) {
            that.result = oppsite(that.current);
        }

        if (countTile(that.current) === 1) {
            that.result = oppsite(that.current);
        }
    };

    /* private methods */
    var get = function (index) {
        if (index) {
            return that.at(index);
        }
    };

    var testMove = function (start, next) {
        var cond = get(start) === that.current &&
                   get(next(start)) === 'empty';
        if (cond) {
            return {from: start, to: next(start)};
        }
    };

    var testAttackClose = function (start, next) {
        var cond = get(start) === that.current &&
                   get(next(start)) === that.current &&
                   get(next(next(start))) === oppsite(that.current);
        if (cond) {
            return {from: start, to: next(next(start))};
        }
    };

    var testAttackFar = function (start, next) {
        var cond = get(start) === that.current &&
                   get(next(start)) === that.current &&
                   get(next(next(start))) === 'empty' &&
                   get(next(next(next((start))))) === oppsite(that.current);
        if (cond) {
            return {from: start, to: next(next(next(start)))};
        }
    };

    var countTile = function (tile) {
        return _.filter(mapPoints(get), function (t) {
            return t === tile;
        }).length;
    };

    return that;

};
