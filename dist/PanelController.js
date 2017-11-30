"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const rpio = require("rpio");
const wires = {
    red: 3,
    blue: 5,
    yellow: 7,
};
class PanelController {
    constructor(panels, eventHandler, lightsHandler, pollRateMsec = 250) {
        this.panels = [];
        this.prevConnections = [];
        this.pollRateMsec = pollRateMsec;
        this.onEvent = eventHandler;
        this.onLights = lightsHandler;
        this.panels = panels;
        this.setup();
        this.prevConnections = this.getConnections();
        // Begin polling for wire connections
        setInterval(this.poll.bind(this), pollRateMsec);
    }
    setup() {
        // Set up wire pins for writing
        Object.values(wires).forEach(pin => {
            rpio.open(pin, rpio.OUTPUT, rpio.LOW);
            rpio.pud(pin, rpio.PULL_DOWN);
        });
        // Set up all panel pins for reading
        _.flatten(_.map(this.panels, 'pins')).forEach(pin => {
            rpio.open(pin, rpio.INPUT);
            rpio.pud(pin, rpio.PULL_DOWN);
        });
    }
    // Returns the colors of the wires plugged into panel
    colorsForPanel(connections, panel) {
        return connections
            .filter(conn => conn.panel && panel && conn.panel.name === panel.name)
            .map(connection => connection.color);
    }
    poll() {
        const connections = this.getConnections();
        const newConnections = _.differenceWith(connections, this.prevConnections, _.isEqual);
        // If there were no new connections, just return early
        if (_.isEmpty(newConnections)) {
            return;
        }
        // Dispatch server events and change lights based on new connections
        newConnections.forEach(({ color, panel }) => {
            let panelToUse;
            if (panel) {
                // Connection added, use the panel it was added to
                panelToUse = panel;
            }
            else {
                // Connection removed, find the panel it was previously connected to and remove it
                const previousConnection = this.prevConnections.find((conn) => conn.color === color);
                panelToUse = previousConnection.panel;
            }
            const allColors = this.colorsForPanel(connections, panelToUse);
            // Create a serialized event for every new connection we just discovered
            const event = this.eventForPanelWithColors(panelToUse, allColors);
            const lights = panel.toLights(allColors);
            this.onEvent(event);
            this.onLights(lights);
        });
        this.prevConnections = connections;
    }
    // Create an event based on the panel and wires
    eventForPanelWithColors(panel, colors) {
        return {
            name: panel.name,
            data: panel.toData(colors),
        };
    }
    panelWireIsPluggedInto(pin) {
        // Set all wire pins to LOW
        Object.values(wires).forEach(p => rpio.write(p, rpio.LOW));
        // Set the we're testing in to HIGH
        rpio.write(pin, rpio.HIGH);
        // Find the panel that the wire is plugged into
        const panel = _.find(this.panels, ({ name, pins }) => {
            return pins.some(p => Boolean(rpio.read(p)));
        });
        return panel || null;
    }
    getConnections() {
        return _.map(wires, (pin, color) => {
            const panel = this.panelWireIsPluggedInto(pin);
            return { color, panel };
        });
    }
}
exports.PanelController = PanelController;
//# sourceMappingURL=PanelController.js.map