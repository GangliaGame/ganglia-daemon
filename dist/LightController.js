"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const ws281x = require('rpi-ws281x-native'); // tslint:disable-line
class LightController {
    constructor(numLights) {
        this.lights = [];
        this.numLights = numLights;
        this.setup();
    }
    setLights(lights) {
        this.lights = lights;
        this.updateLights();
    }
    teardown() {
        ws281x.reset();
    }
    updateLights() {
        const pixelData = new Uint32Array(this.numLights);
        _.times(this.numLights, i => {
            const light = this.lights.find(({ index }) => index === i);
            if (light) {
                pixelData[i] = light.color;
            }
        });
        ws281x.render(pixelData);
    }
    setup() {
        ws281x.init(this.numLights);
    }
}
exports.LightController = LightController;
//# sourceMappingURL=LightController.js.map