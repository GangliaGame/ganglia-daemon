"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpio = require("rpio");
const _ = require("lodash");
const colors = require("colors/safe");
const client_1 = require("./client");
const panels_1 = require("./panels");
const POLL_MSEC = 250;
const wires = {
    red: 3,
    blue: 5,
    yellow: 7,
};
function panelWireIsPluggedInto(pin) {
    // Set all wire pins to LOW
    Object.values(wires).forEach(p => rpio.write(p, rpio.LOW));
    // Set the we're testing in to HIGH
    rpio.write(pin, rpio.HIGH);
    // Find the panel that the wire is plugged into
    const panel = _.find(panels_1.panels, ({ name, pins }) => {
        return pins.some(p => Boolean(rpio.read(p)));
    });
    return panel || null;
}
function printConnections(assignments) {
    console.log('\n');
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
function getEvents(assignments) {
    return _.chain(assignments)
        .filter(({ panel }) => panel !== null)
        .groupBy(({ panel }) => panel.name)
        .map((a, name) => ({
        name,
        toData: a[0].panel.toData,
        colors: _.map(a, 'color'),
    }))
        .map(({ name, toData, colors }) => ({
        name,
        data: toData(colors)
    }))
        .value();
}
function getConnections() {
    return _.map(wires, (pin, color) => {
        const panel = panelWireIsPluggedInto(pin);
        return { color, panel };
    });
}
(function main() {
    const serverUrl = process.env.GANGLIA_SERVER_URL || 'http://localhost:9000';
    const client = new client_1.Client(serverUrl);
    // Set up color wires for writing
    Object.values(wires).forEach(pin => {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);
        rpio.pud(pin, rpio.PULL_DOWN);
    });
    // Set up all pins for reading
    _.flatten(_.map(panels_1.panels, 'pins')).forEach(pin => {
        rpio.open(pin, rpio.INPUT);
        rpio.pud(pin, rpio.PULL_DOWN);
    });
    // Periodically check for new connections
    let connections = getConnections();
    function poll() {
        const newConnections = getConnections();
        const diff = _.differenceWith(connections, newConnections, _.isEqual);
        if (!_.isEmpty(diff)) {
            console.log(diff);
            connections = newConnections;
        }
    }
    // Begin polling
    setInterval(poll, POLL_MSEC);
    console.log('Ganglia Daemon is reborn!\n');
    console.log(`${colors.bold('Poll rate')}: ${1000 / POLL_MSEC} Hz`);
    console.log(`${colors.bold('Server')}: ${serverUrl}`);
})();
//# sourceMappingURL=index.js.map