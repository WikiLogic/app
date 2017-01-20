"use strict";

var taglines = [
    "Rational exploration",
    "The logic of everything",
    "For and against arguments for everything"
]

module.exports.giveMeOne = function(){
    return taglines[Math.floor(Math.random() * (taglines.length - 0))];
}