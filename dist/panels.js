"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const types_1 = require("./types");
const rpio = require("rpio");
class WeaponsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'weapons';
        this.pins = [11, 13, 15];
        this.lights = [];
        this.lightIndicies = [0, 1, 2];
        this.buttonLightPins = [24];
    }
    toData(colorPositions) {
        return _.map(colorPositions, 'color');
    }
    update(colorPositions) {
        const isButtonLit = colorPositions.length > 0;
        _.forEach(this.buttonLightPins, pin => {
            rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
        });
        // Set LED lights for later batch-update
        this.lights = colorPositions
            .filter(({ position }) => position !== null)
            .map(({ color, position }) => ({
            index: this.lightIndicies[position],
            color: types_1.LightColor[color],
        }));
    }
}
class ShieldsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'shields';
        this.pins = [19, 21, 23];
        this.lights = [];
        this.lightIndicies = [5, 4, 3]; // LEDs were installed backwards
    }
    toData(colorPositions) {
        return _.map(colorPositions, 'color');
    }
    setButtonLight(colorPositions) {
        return;
    }
    update(colorPositions) {
        this.lights = colorPositions
            .filter(({ position }) => position !== null)
            .map(({ color, position }) => ({
            index: this.lightIndicies[position],
            color: types_1.LightColor[color],
        }));
    }
}
//
// class PropulsionPanel extends Panel {
//   public readonly name = 'propulsion'
//   public readonly pins = [33, 35]
//   public lights: Light[] = []
//   public readonly lightIndicies = [6, 7]
//   public readonly buttonLightPins = [26, 28]
//
//   public toData(colorPositions: ColorPosition[]) {
//     return colorPositions.length
//   }
//
//   public update(colorPositions: ColorPosition[]) {
//     const isButtonLit = colorPositions.length > 0
//     _.forEach(this.buttonLightPins, pin => {
//       rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW)
//     })
//
//     this.lights = _.times(colorPositions.length, i => ({
//       index: this.lightIndicies[i],
//       color: LightColor.purple,
//     }))
//   }
// }
//
// class RepairsPanel extends Panel {
//   public readonly name = 'repairs'
//   public readonly pins = [27, 29, 31]
//   public lights: Light[] = []
//   public readonly lightIndicies = [10, 9, 8] // LEDs were installed backwards
//
//   public toData(colorPositions: ColorPosition[]) {
//     return colorPositions.length
//   }
//
//   public update(colorPositions: ColorPosition[]): void {
//     this.lights = _.times(colorPositions.length, i => ({
//       index: this.lightIndicies[i],
//       color: LightColor.green,
//     }))
//   }
// }
//
// class CommunicationsPanel extends Panel {
//   public readonly name = 'communications'
//   public readonly pins = [37]
//   public lights: Light[] = []
//   public readonly lightIndicies = [11]
//
//   public toData(colorPositions: ColorPosition[]) {
//     return colorPositions.length > 0
//   }
//
//   public update(colorPositions: ColorPosition[]): void {
//     this.lights = _.times(colorPositions.length, i => ({
//       index: this.lightIndicies[i],
//       color: LightColor.red,
//     }))
//   }
// }
const panels = [
    new WeaponsPanel(),
    new ShieldsPanel(),
];
exports.panels = panels;
//# sourceMappingURL=panels.js.map