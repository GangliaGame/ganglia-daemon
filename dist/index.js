"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpio = require("rpio");
const _ = require("lodash");
const io = require("socket.io-client");
const colors = require("colors/safe");
const socket = io('http://localhost:9000');
const clearConsole = () => process.stdout.write('\x1Bc');
const POLL_MSEC = 250;
const wires = {
    red: 3,
    blue: 5,
    yellow: 7,
};
const panels = [
    {
        name: 'weapons',
        pins: [11, 13, 15],
        handler: colors => colors
    },
    {
        name: 'shields',
        pins: [19, 21, 23],
        handler: colors => colors
    },
    {
        name: 'propulsion',
        pins: [8, 10],
        handler: colors => colors.length
    },
    {
        name: 'regen',
        pins: [36, 38, 40],
        handler: colors => colors.length
    },
    {
        name: 'communications',
        pins: [16],
        handler: colors => colors.length > 0
    },
];
// Set up color wires for writing
Object.values(wires).forEach(pin => {
    rpio.open(pin, rpio.OUTPUT, rpio.LOW);
    rpio.pud(pin, rpio.PULL_DOWN);
});
// Set up all pins for reading
_.flatten(_.map(panels, 'pins')).forEach(pin => rpio.open(pin, rpio.INPUT));
function panelWireIsPluggedInto(pin) {
    // Set all wire pins to LOW
    Object.values(wires).forEach(p => rpio.write(p, rpio.LOW));
    // Set the one we're testing to HIGH
    rpio.write(pin, rpio.HIGH);
    // Find the panel that the wire is plugged into
    const panel = _.find(panels, ({ name, pins }) => {
        return pins.some(p => Boolean(rpio.read(p)));
    });
    return panel || null;
}
console.log(`polling every ${colors.bold(String(POLL_MSEC))} ms`);
function printAssignments(assignments) {
    assignments.forEach(({ color, panel }) => {
        let colorFn;
        if (color === 'red')
            colorFn = colors.red;
        else if (color === 'yellow')
            colorFn = colors.yellow;
        else if (color === 'blue')
            colorFn = colors.blue;
        else
            colorFn = console.log;
        console.log(`${colorFn(color)} => ${panel ? panel.name : ''}`);
    });
}
function events(assignments) {
    return _.chain(assignments)
        .filter(({ panel }) => panel !== null)
        .groupBy(({ panel }) => panel.name)
        .map((a, name) => ({
        name,
        handler: a[0].panel.handler,
        colors: _.map(a, 'color'),
    }))
        .map(({ name, handler, colors }) => ({
        name,
        data: handler(colors)
    }))
        .value();
}
function dispatchEvents(assignments) {
    events(assignments).forEach(({ name, data }) => socket.emit(name, data));
}
const mockAssignments = [
    {
        color: 'red',
        panel: panels[0],
    },
    {
        color: 'blue',
        panel: panels[2],
    },
    {
        color: 'yellow',
        panel: panels[1],
    },
];
let assignments = [];
// while (1) {
const newAssignments = _.map(wires, (pin, color) => {
    const panel = panelWireIsPluggedInto(pin);
    return { color, panel };
});
if (!_.isEqual(assignments, newAssignments)) {
    // clearConsole()
    assignments = newAssignments;
    printAssignments(assignments);
    dispatchEvents(mockAssignments);
    // console.log(proc(assignments))
}
// rpio.msleep(POLL_MSEC)
// }
socket.on('connect', () => {
    console.log('connected!');
});
// socket.on('event', data => {
//
// })
socket.on('disconnect', () => {
    console.log('disconnected!');
});
//# sourceMappingURL=index.js.map