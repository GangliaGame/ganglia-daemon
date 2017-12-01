"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const colors = require("colors/safe");
const client_1 = require("./client");
const panels_1 = require("./panels");
const buttons_1 = require("./buttons");
const ButtonController_1 = require("./ButtonController");
const PanelController_1 = require("./PanelController");
const LightController_1 = require("./LightController");
(function main() {
    // Create a client to interact with the server
    const client = new client_1.Client(process.env.GANGLIA_SERVER_URL || 'http://localhost:9000');
    // Create a panel controller to manage plugging and unplugging wires into panels
    const panelController = new PanelController_1.PanelController(panels_1.panels, onEvent);
    // Create a button controller to manage button presses
    const buttonController = new ButtonController_1.ButtonController(buttons_1.buttons, onEvent);
    // Create a light controller
    const numLights = lodash_1.flatten(panels_1.panels.map(p => p.lightIndicies)).length;
    const lightController = new LightController_1.LightController(numLights);
    // Update lights (all at once, since they are daisy-chained via PWM)
    function updateLights() {
        const allLights = lodash_1.flatten(panelController.panels.map(panel => panel.lights));
        lightController.setLights(allLights);
    }
    // Dispatch event to client and update other state as needed
    function onEvent(event) {
        //
        function colorize(data) {
            if (typeof data !== typeof Array) {
                return data;
            }
            return data.map((datum) => {
                if (typeof datum !== typeof String) {
                    return datum;
                }
                if (datum === 'red') {
                    return colors.red(datum);
                }
                if (datum === 'yellow') {
                    return colors.yellow(datum);
                }
                if (datum === 'blue') {
                    return colors.blue(datum);
                }
            });
        }
        console.info(`${event.name} => ${JSON.stringify(colorize(event.data))}`);
        client.emit(event);
        updateLights();
    }
    console.info(`\n${colors.bold('Wire poll rate')}: ${1000 / panelController.pollRateMsec} Hz`);
    console.info(`${colors.bold('Button poll rate')}: ${1000 / buttonController.pollRateMsec} Hz`);
    console.info(`${colors.bold('Server')}: ${client.url}\n`);
    console.info(`${colors.cyan('Ganglia Daemon is reborn!\n')}`);
    process.on('SIGINT', () => {
        lightController.teardown();
        process.nextTick(() => process.exit(0));
    });
})();
//# sourceMappingURL=index.js.map