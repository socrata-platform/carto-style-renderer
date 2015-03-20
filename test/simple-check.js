/**
 * A simple module for performing QuickCheck like tests.
 * @module simple-check
 */

(function() {
    "use strict";

    var Chance = require("chance").Chance;
    var chance = new Chance(4);

    var invoke = function(f) {
        return f();
    };

    var forAll = function() {
        var f = arguments[arguments.length - 1];
        var gens = Array.prototype.slice.call(
            arguments, 0, arguments.length - 1);

        for (var i = 0; i < 100; i++) {
            var args = Array.prototype.map.call(gens, invoke);
            try {
                f.apply(f, args);
            } catch (e) {
                var message = "\n        Given:";
                for (var n = 0; n < args.length; n++) {
                    var arg = args[n];
                    var str = arg.toString();
                    if (typeof arg === "object") {
                        str = JSON.stringify(arg);
                    }
                    message += "\n          arg" + n + " = " + str;
                }
                e.message += message;
                throw e;
            }
        }
    };

    // Generators.
    var number = function() {
        var nums = [ function() { return 0.0; },
                     function() { return chance.random(); },
                     function() { return chance.random() * 10; },
                     function() { return chance.random() * 100; },
                     function() { return chance.random() * 1000; },
                     function() { return chance.random() * 10000; },
                     function() { return chance.random() * 100000; },
                     function() { return chance.random() * 1000000; },
                     function() { return chance.random() * 10000000; },
                     function() { return chance.integer(); }];
        return chance.pick(nums)();
    };

    var integer = function(min, max) {
        if (typeof min !== "undefined" && typeof max !== "undefined") {
            return chance.integer({min: min, max: max});
        } else {
            return Math.floor(number());
        }
    };

    var string = function() {
        var strs = [ function() { return ""; },
                     function() { return chance.floating() + ""; },
                     function() { return chance.integer() + ""; },
                     function() { return chance.integer() + "."; },
                     function() { return chance.integer() + "e"; },
                     function() {
                         return chance.integer() + "e" + chance.integer();
                     },
                     function() { return chance.string({ length: 1}); },
                     function() { return chance.string({ length: 2}); },
                     function() { return chance.string({ length: 3}); },
                     function() { return chance.string({ length: 4}); },
                     function() { return chance.string(); },
                     function() { return chance.string({ length: 1}); },
                     function() { return chance.string({ length: 2}); },
                     function() { return chance.string({ length: 3}); },
                     function() { return chance.string({ length: 4}); },
                     function() { return chance.string(); }];

        return chance.pick(strs)();
    };

    var dictionary = function() {
        var ret = Object.create(null);
        var max = integer(1, 5);
        for (var i = 0; i < max; i++) {
            ret[string()] = string();
        }

        return ret;
    };

    /** @function forAll
     The primary function, calls `generators` and passes the results
     to `body`.

     @param {...function} generators - a series of zero argument
     functions that each return a value.
     @param {function} body - the body to be executed, it will be
     invoked with the results evaluating `generators`.
     */
    module.exports.forAll = forAll;
    /** @function number - generate a random number. */
    module.exports.number = number;
    /** @function integer - generate a random integer. */
    module.exports.integer = integer;
    /** @function string - generate a random string. */
    module.exports.string = string;
    /** @function dictionary - generate a simple object with no methods. */
    module.exports.dictionary = dictionary;
}());
