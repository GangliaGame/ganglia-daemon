"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
class Client {
    constructor(url, onGameStart, onGameOver) {
        this.url = url;
        this.socket = io(url, { reconnection: true });
        this.socket.on('gamestart', onGameStart);
        this.socket.on('gameover', onGameOver);
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
    }
    emit(event) {
        const { name, data } = event;
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
//# sourceMappingURL=client.js.map