"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpio = require("rpio");
const _ = require("lodash");
const colors = require("colors/safe");
const POLL_MSEC = 250;
const ColorWire = {
    red: 3,
    blue: 5,
    yellow: 7,
};
const panels = [
    {
        name: 'weapons',
        pins: [11, 13, 15],
    },
];
// Set up color wires for writing
Object.values(ColorWire).forEach(pin => {
    rpio.open(pin, rpio.OUTPUT, rpio.LOW);
    rpio.pud(pin, rpio.PULL_DOWN);
});
// Set up all pins for reading
_.flatten(_.map(panels, 'pins')).forEach(pin => rpio.open(pin, rpio.INPUT));
function panelWireIsPluggedInto(color) {
    Object.values(ColorWire).forEach(pin => (rpio.write(pin, rpio.LOW)));
    rpio.write(color, rpio.HIGH);
    const panel = _.find(panels, ({ name, pins }) => {
        return pins.some(pin => Boolean(rpio.read(pin)));
    });
    return panel || null;
}
console.log(`polling every ${colors.bold(String(POLL_MSEC))} ms`);
let old = null;
while (1) {
    const m = Object.entries(ColorWire).map(([colorName, pin]) => {
        const panel = panelWireIsPluggedInto(pin);
        return {
            color: colorName,
            state: panel ? panel.name : null,
        };
    });
    if (!_.isEqual(old, m)) {
        m.forEach(({ color, state }) => {
            let colorFn;
            if (color === 'red')
                colorFn = colors.red;
            else if (color === 'yellow')
                colorFn = colors.yellow;
            else if (color === 'blue')
                colorFn = colors.blue;
            else
                colorFn = console.log;
            console.log(`${colorFn('red')} => ${state}`);
        });
        console.log(m);
        old = m;
    }
    rpio.msleep(POLL_MSEC);
}
//# sourceMappingURL=index.js.map