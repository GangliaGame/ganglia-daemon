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
    const serverUrl = process.env.GANGLIA_SERVER_URL || 'http://localhost:9000';
    const client = new client_1.Client(serverUrl);
    function onEvent(event) {
        client.emit(event);
    }
    function onLights(lights) {
        lightController.setLights(lights);
    }
    // Create a panel controller to manage plugging and unplugging wires into panels
    const panelController = new PanelController_1.PanelController(panels_1.panels, onEvent, onLights);
    // Create a button controller to manage button presses
    const buttonController = new ButtonController_1.ButtonController(buttons_1.buttons, onEvent);
    // Create a light controller
    const numLights = lodash_1.flatten(panels_1.panels.map(p => p.lightIndicies)).length;
    const lightController = new LightController_1.LightController(numLights);
    console.info(`\n${colors.bold('Wire poll rate')}: ${1000 / panelController.pollRateMsec} Hz`);
    console.info(`${colors.bold('Button poll rate')}: ${1000 / buttonController.pollRateMsec} Hz`);
    console.info(`${colors.bold('Server')}: ${serverUrl}\n`);
    console.info(`${colors.zalgo('Ganglia Daemon is reborn!\n')}`);
    process.on('SIGINT', () => {
        lightController.teardown();
        process.nextTick(() => process.exit(0));
    });
})();
//# sourceMappingURL=index.js.map