"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpio = require("rpio");
const _ = require("lodash");
function isButtonPressed(button) {
    return rpio.read(button.pin) ? false : true;
}
class ButtonController {
    constructor(buttons, eventHandler, pollRateMsec = 50) {
        this.pollRateMsec = pollRateMsec;
        this.onEvent = eventHandler;
        this.buttons = buttons;
        this.setup();
        this.prevPresses = this.getPresses();
        // Begin polling for wire connections
        setInterval(this.poll, pollRateMsec);
    }
    setup() {
        // Set up button pins for reading
        this.buttons.forEach(({ pin }) => {
            rpio.open(pin, rpio.INPUT, rpio.PULL_UP);
        });
    }
    poll() {
        const presses = this.getPresses();
        const newPresses = _.differenceWith(presses, this.prevPresses, _.isEqual);
        // If there were no new presses, just return early
        if (_.isEmpty(newPresses)) {
            return;
        }
        const events = newPresses.map(({ button, state }) => ({
            name: button.name,
            data: button.toData(state),
        }));
        // dispatch events
        events.forEach(event => this.onEvent(event));
        this.prevPresses = presses;
    }
    getPresses() {
        return this.buttons.map(button => {
            const isPressed = isButtonPressed(button);
            return {
                button,
                state: (isPressed ? 'pressed' : 'released'),
            };
        });
    }
}
exports.ButtonController = ButtonController;
//# sourceMappingURL=ButtonController.js.map