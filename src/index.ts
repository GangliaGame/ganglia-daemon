import * as rpio from 'rpio'

rpio.open(11, rpio.INPUT);
console.log('Pin 11 is currently set ' + (rpio.read(11) ? 'high' : 'low'));

// console.log('hello!')
