"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
class Client {
    constructor(url) {
        this.url = url;
        this.socket = io(url, { reconnection: true });
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
    }
    emit(event) {
        const { name, data } = event;
        console.info(`${name} => ${data}`);
        this.socket.emit(name, data);
    }
    onConnect() {
        console.info('Connected to server');
    }
    onDisconnect() {
        console.warn('Disconnected from server');
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map