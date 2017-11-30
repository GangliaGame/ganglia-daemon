"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpio = require("rpio");
const _ = require("lodash");
const colors = require("colors/safe");
const client_1 = require("./client");
const panels_1 = require("./panels");
const ws281x = require('rpi-ws281x-native');
// import  * as ws281x from
const WIRE_POLL_MSEC = 250;
const BUTTON_POLL_MSEC = 50;
const wires = {
    red: 3,
    blue: 5,
    yellow: 7,
};
const buttons = [
    {
        name: 'fire',
        pin: 8,
        toData: state => state === 'pressed' ? 'start' : 'stop',
    },
    {
        name: 'move-up',
        pin: 16,
        toData: state => state === 'pressed' ? 'start' : 'stop',
    },
    {
        name: 'move-down',
        pin: 18,
        toData: state => state === 'pressed' ? 'start' : 'stop',
    },
];
function isButtonPressed(button) {
    return rpio.read(button.pin) ? false : true;
}
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
function getConnections() {
    return _.map(wires, (pin, color) => {
        const panel = panelWireIsPluggedInto(pin);
        return { color, panel };
    });
}
function getPresses() {
    return _.map(buttons, button => {
        const isPressed = isButtonPressed(button);
        return {
            button,
            state: (isPressed ? 'pressed' : 'released'),
        };
    });
}
// Create an event based on the panel and wires
function eventForPanelWithColors(panel, colors) {
    return {
        name: panel.name,
        data: panel.toData(colors),
    };
}
// Returns the colors of the wires plugged into panel
function colorsForPanel(connections, panel) {
    return connections
        .filter(conn => conn.panel && panel && conn.panel.name === panel.name)
        .map(connection => connection.color);
}
(function main() {
    const serverUrl = process.env.GANGLIA_SERVER_URL || 'http://localhost:9000';
    const client = new client_1.Client(serverUrl);
    // Set up wire pins for writing
    Object.values(wires).forEach(pin => {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);
        rpio.pud(pin, rpio.PULL_DOWN);
    });
    // Set up all panel pins for reading
    _.flatten(_.map(panels_1.panels, 'pins')).forEach(pin => {
        rpio.open(pin, rpio.INPUT);
        rpio.pud(pin, rpio.PULL_DOWN);
    });
    // Set up button pins for reading
    buttons.forEach(({ pin }) => {
        rpio.open(pin, rpio.INPUT, rpio.PULL_UP);
    });
    // Initialize lights
    const numLights = _.flatten(panels_1.panels.map(p => p.lightIndicies)).length;
    ws281x.init(numLights);
    // Periodically check for new connections
    let prevConnections = getConnections();
    function pollWires() {
        const connections = getConnections();
        const newConnections = _.differenceWith(connections, prevConnections, _.isEqual);
        // If there were no new connections, just return early
        if (_.isEmpty(newConnections))
            return;
        // Create a serialized event for every new connection we just discovered
        const events = newConnections.map(({ color, panel }) => {
            // Connection added to panel
            if (panel) {
                const allColors = colorsForPanel(connections, panel);
                const lights = panel.toLights(allColors);
                console.log('lights', lights);
                return eventForPanelWithColors(panel, allColors);
            }
            // Connection removed, find the panel it was previously connected to and remove it
            const previousConnection = prevConnections.find((conn) => conn.color === color);
            const allColors = colorsForPanel(connections, previousConnection.panel);
            const lights = previousConnection.panel.toLights(allColors);
            console.log('lights', lights);
            return eventForPanelWithColors(previousConnection.panel, allColors);
        });
        events.map(event => client.emit(event));
        prevConnections = connections;
    }
    // Periodically check for new connections
    let prevPresses = getPresses();
    function pollButtons() {
        const presses = getPresses();
        const newPresses = _.differenceWith(presses, prevPresses, _.isEqual);
        // If there were no new presses, just return early
        if (_.isEmpty(newPresses))
            return;
        const events = newPresses.map(({ button, state }) => ({
            name: button.name,
            data: button.toData(state),
        }));
        events.map(event => client.emit(event));
        prevPresses = presses;
    }
    // Begin polling for wire connections
    setInterval(pollWires, WIRE_POLL_MSEC);
    // Begin polling for button presses
    setInterval(pollButtons, BUTTON_POLL_MSEC);
    console.log('Ganglia Daemon is reborn!\n');
    console.log(`${colors.bold('Wire poll rate')}: ${1000 / WIRE_POLL_MSEC} Hz`);
    console.log(`${colors.bold('Button poll rate')}: ${1000 / BUTTON_POLL_MSEC} Hz`);
    console.log(`${colors.bold('Server')}: ${serverUrl}`);
});
process.on('SIGINT', () => {
    ws281x.reset();
    process.nextTick(() => process.exit(0));
});
//# sourceMappingURL=index.js.map