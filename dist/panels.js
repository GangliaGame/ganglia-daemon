"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const types_1 = require("./types");
class WeaponsPanel {
    constructor() {
        this.name = 'weapons';
        this.pins = [11, 13, 15];
        this.lights = [];
        this.lightIndicies = [0, 1, 2];
    }
    toData(colors) {
        return colors;
    }
    updateLights(colors) {
        this.lights = colors.map((color, i) => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor[color],
        }));
    }
}
class ShieldsPanel {
    constructor() {
        this.name = 'shields';
        this.pins = [19, 21, 23];
        this.lights = [];
        this.lightIndicies = [3, 4, 5];
    }
    toData(colors) {
        return colors;
    }
    updateLights(colors) {
        this.lights = colors.map((color, i) => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor[color],
        }));
    }
}
class PropulsionPanel {
    constructor() {
        this.name = 'propulsion';
        this.pins = [35, 37];
        this.lights = [];
        this.lightIndicies = [6, 7];
    }
    toData(colors) {
        return colors.length;
    }
    updateLights(colors) {
        this.lights = _.times(colors.length, i => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor.purple,
        }));
    }
}
class RepairsPanel {
    constructor() {
        this.name = 'repairs';
        this.pins = [36, 38, 40];
        this.lights = [];
        this.lightIndicies = [8, 9, 10];
    }
    toData(colors) {
        return colors.length;
    }
    updateLights(colors) {
        this.lights = _.times(colors.length, i => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor.green,
        }));
    }
}
class CommunicationsPanel {
    constructor() {
        this.name = 'communications';
        this.pins = [27];
        this.lights = [];
        this.lightIndicies = [11];
    }
    toData(colors) {
        return colors.length > 0;
    }
    updateLights(colors) {
        if (colors.length === 0) {
            this.lights = [];
        }
        this.lights = [{
                index: this.lightIndicies[0],
                color: types_1.LightColor.red,
            }];
    }
}
const panels = [
    new WeaponsPanel(),
    new ShieldsPanel(),
    new PropulsionPanel(),
    new RepairsPanel(),
    new CommunicationsPanel(),
];
exports.panels = panels;
//# sourceMappingURL=panels.js.map