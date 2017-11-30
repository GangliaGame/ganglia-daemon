"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class WeaponsPanel {
    constructor() {
        this.name = 'weapons';
        this.pins = [11, 13, 15];
    }
    toData(colors) {
        return colors;
    }
    toLights(colors) {
        return colors.map((color, i) => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor[color]
        }));
    }
}
class ShieldsPanel {
    constructor() {
        this.name = 'shields';
        this.pins = [19, 21, 23];
    }
    toData(colors) {
        return colors;
    }
    toLights(colors) {
        return colors.map((color, i) => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor[color]
        }));
    }
}
class PropulsionPanel {
    constructor() {
        this.name = 'propulsion';
        this.pins = [35, 37];
    }
    toData(colors) {
        return colors.length;
    }
    toLights(colors) {
        return [];
    }
}
class RepairsPanel {
    constructor() {
        this.name = 'repairs';
        this.pins = [36, 38, 40];
    }
    toData(colors) {
        return colors.length;
    }
    toLights(colors) {
        return [];
    }
}
class CommunicationsPanel {
    constructor() {
        this.name = 'communications';
        this.pins = [27];
    }
    toData(colors) {
        return colors.length > 0;
    }
    toLights(colors) {
        return [];
    }
}
const panels = [
    new WeaponsPanel,
    new ShieldsPanel,
    new PropulsionPanel,
    new RepairsPanel,
    new CommunicationsPanel,
];
exports.panels = panels;
//# sourceMappingURL=panels.js.map