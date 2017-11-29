"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpio = require("rpio");
const POLL_MSEC = 250;
const ColorWire = {
    red: 3,
    blue: 5,
    yellow: 7,
};
const weaponPins = [11, 13, 15];
// Set up color wires for writing
rpio.open(ColorWire.red, rpio.OUTPUT, rpio.LOW);
rpio.open(ColorWire.blue, rpio.OUTPUT, rpio.LOW);
rpio.open(ColorWire.yellow, rpio.OUTPUT, rpio.LOW);
// Set up weapon pins for reading
weaponPins.forEach(pin => rpio.open(pin, rpio.INPUT));
function checkColor(color) {
    rpio.write(ColorWire.red, rpio.LOW);
    rpio.write(ColorWire.blue, rpio.LOW);
    rpio.write(ColorWire.yellow, rpio.LOW);
    rpio.write(color, rpio.HIGH);
    return weaponPins.find(pin => Boolean(rpio.read(pin))) || null;
}
while (1) {
    Object.entries(ColorWire).forEach(([name, pin]) => {
        const colorPin = checkColor(pin);
        console.log(`${name}: ${colorPin}`);
    });
    rpio.msleep(POLL_MSEC);
}
//# sourceMappingURL=index.js.map