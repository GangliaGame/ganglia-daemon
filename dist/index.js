"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpio = require("rpio");
const _ = require("lodash");
const colors = require("colors/safe");
const client_1 = require("./client");
const panels_1 = require("./panels");
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
        toData: cur => cur,
    }
];
function isButtonPressed(button) {
    return Boolean(rpio.read(button.pin));
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
                return eventForPanelWithColors(panel, allColors);
            }
            // Connection removed, find the panel it was previously connected to and remove it
            const previousConnection = prevConnections.find((conn) => conn.color === color);
            const allColors = colorsForPanel(connections, previousConnection.panel);
            return eventForPanelWithColors(previousConnection.panel, allColors);
        });
        events.map(event => client.emit(event));
        prevConnections = connections;
    }
    let prev = false;
    function pollButtons() {
        buttons.map(button => {
            const cur = isButtonPressed(button);
            if (prev == cur)
                return;
            console.log(`${button.name} => ${cur ? 'pressed' : 'released'}`);
            prev = cur;
        });
    }
    // Begin polling for wire connections
    setInterval(pollWires, WIRE_POLL_MSEC);
    // Begin polling for button presses
    setInterval(pollButtons, BUTTON_POLL_MSEC);
    console.log('Ganglia Daemon is reborn!\n');
    console.log(`${colors.bold('Wire poll rate')}: ${1000 / WIRE_POLL_MSEC} Hz`);
    console.log(`${colors.bold('Button poll rate')}: ${1000 / BUTTON_POLL_MSEC} Hz`);
    console.log(`${colors.bold('Server')}: ${serverUrl}`);
})();
//# sourceMappingURL=index.js.map