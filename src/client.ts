import * as io from 'socket.io-client'
import { Event } from './types'

export class Client {

 socket: SocketIOClient.Socket

  constructor(url: string) {
    this.socket = io(url, { reconnection: true })
    this.socket.on('connect', this.onConnect.bind(this))
    this.socket.on('disconnect', this.onDisconnect.bind(this))
  }

  private onConnect() {
    console.log('Connected to server')
  }

  private onDisconnect() {
    console.warn('Disconnected from server')
  }

  public emit(event: Event) {
    const { name, data } = event
    this.socket.emit(name, data)
  }

}
