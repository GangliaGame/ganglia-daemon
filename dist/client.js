"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
class Client {
    constructor(url) {
        this.socket = io(url, { reconnection: true });
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
    }
    onConnect() {
        console.log('Connected to server');
    }
    onDisconnect() {
        console.warn('Disconnected from server');
    }
    emit(event) {
        const { name, data } = event;
        console.log(`${name} => ${data}`);
        this.socket.emit(name, data);
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map