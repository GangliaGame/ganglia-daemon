"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpio = require("rpio");
rpio.open(11, rpio.INPUT);
console.log('Pin 11 is currently set ' + (rpio.read(11) ? 'high' : 'low'));
// console.log('hello!')
//# sourceMappingURL=index.js.map