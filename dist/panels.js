"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const types_1 = require("./types");
class WeaponsPanel {
    constructor() {
        this.name = 'weapons';
        this.pins = [15, 13, 11]; // pins installed in weird order
        this.lights = [];
        this.lightIndicies = [0, 1, 2];
    }
    toData(colorPositions) {
        return _.map(colorPositions, 'color');
    }
    updateLights(colorPositions) {
        this.lights = colorPositions
            .filter(({ position }) => position !== null)
            .map(({ color, position }) => ({
            index: this.lightIndicies[position],
            color: types_1.LightColor[color],
        }));
    }
}
class ShieldsPanel {
    constructor() {
        this.name = 'shields';
        this.pins = [21, 19, 23]; // pins installed in weird order
        this.lights = [];
        this.lightIndicies = [5, 4, 3]; // LEDs were installed backwards
    }
    toData(colorPositions) {
        return _.map(colorPositions, 'color');
    }
    updateLights(colorPositions) {
        this.lights = colorPositions
            .filter(({ position }) => position !== null)
            .map(({ color, position }) => ({
            index: this.lightIndicies[position],
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
    toData(colorPositions) {
        return colorPositions.length;
    }
    updateLights(colorPositions) {
        this.lights = _.times(colorPositions.length, i => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor.purple,
        }));
    }
}
class RepairsPanel {
    constructor() {
        this.name = 'repairs';
        this.pins = [38, 40, 36]; // pins installed in weird order
        this.lights = [];
        this.lightIndicies = [10, 9, 8]; // LEDs were installed backwards
    }
    toData(colorPositions) {
        return colorPositions.length;
    }
    updateLights(colorPositions) {
        this.lights = _.times(colorPositions.length, i => ({
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
    toData(colorPositions) {
        return colorPositions.length > 0;
    }
    updateLights(colorPositions) {
        this.lights = _.times(colorPositions.length, i => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor.red,
        }));
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