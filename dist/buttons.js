"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buttons = [
    {
        name: 'fire',
        pin: 8,
        toData: (state) => state === 'pressed' ? 'start' : 'stop',
    },
    {
        name: 'move-up',
        pin: 16,
        toData: (state) => state === 'pressed' ? 'start' : 'stop',
    },
    {
        name: 'move-down',
        pin: 18,
        toData: (state) => state === 'pressed' ? 'start' : 'stop',
    },
];
//# sourceMappingURL=buttons.js.map