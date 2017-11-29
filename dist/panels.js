"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const panels = [
    {
        name: 'weapons',
        pins: [11, 13, 15],
        toData: colors => colors
    },
    {
        name: 'shields',
        pins: [19, 21, 23],
        toData: colors => colors
    },
    {
        name: 'propulsion',
        pins: [35, 37],
        toData: colors => colors.length
    },
    {
        name: 'regen',
        pins: [36, 38, 40],
        toData: colors => colors.length
    },
    {
        name: 'communications',
        pins: [27],
        toData: colors => colors.length > 0
    }
];
exports.panels = panels;
//# sourceMappingURL=panels.js.map