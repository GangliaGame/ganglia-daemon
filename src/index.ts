import * as rpio from 'rpio'
import * as _ from 'lodash'
import * as colors from 'colors/safe'
import {WirePin, WireColor, Wire, Panel, Connection, Event} from './types'
import { Client } from './client'
import { panels } from './panels'
const POLL_MSEC = 250

const wires: Wire = {
  red: 3,
  blue: 5,
  yellow: 7,
}

function panelWireIsPluggedInto(pin: WirePin): Panel | null {
  // Set all wire pins to LOW
  Object.values(wires).forEach(p => rpio.write(p, rpio.LOW))
  // Set the we're testing in to HIGH
  rpio.write(pin, rpio.HIGH)
  // Find the panel that the wire is plugged into
  const panel = _.find(panels, ({name, pins}) => {
    return pins.some(p => Boolean(rpio.read(p)))
  })
  return panel || null
}

function getConnections(): Array<Connection> {
  return _.map(wires, (pin: WirePin, color: WireColor) => {
    const panel = panelWireIsPluggedInto(pin)
    return { color, panel }
  })
}



(function main() {
  const serverUrl = process.env.GANGLIA_SERVER_URL || 'http://localhost:9000'
  const client = new Client(serverUrl)

  // Set up color wires for writing
  Object.values(wires).forEach(pin => {
    rpio.open(pin, rpio.OUTPUT, rpio.LOW)
    rpio.pud(pin, rpio.PULL_DOWN);
  });

  // Set up all pins for reading
  _.flatten(_.map(panels, 'pins')).forEach(pin => {
    rpio.open(pin, rpio.INPUT)
    rpio.pud(pin, rpio.PULL_DOWN);
  });

  // Notify the server that the panel has changed
  function notify(panel: Panel, colors: Array<WireColor>) {
    console.log('will emit:')
    console.log(panel.name, panel.toData(colors))
  }

  function colorsForPanel(connections: Array<Connection>, panel: Panel | null) {
    return connections
      .filter(conn => conn.panel && panel && conn.panel.name === panel.name)
      .map(connection => connection.color)
  }

  // Periodically check for new connections
  let prevConnections: Array<Connection> = getConnections()
  function poll() {
    const connections = getConnections()
    const newConnections: Array<Connection> = _.differenceWith(connections, prevConnections, _.isEqual)

    // If there were no new connections, just return early
    if (_.isEmpty(newConnections)) return

    newConnections.map(({color, panel}: {color: WireColor, panel: Panel}) => {
      if (panel === null) {
        const previousConnection = prevConnections.find((conn: Connection) => conn.color === color)
        if (!previousConnection || !previousConnection.panel) { console.log('INVALID STATE'); return }
        // const allColors = connections
        //   .filter(conn => conn.panel && previousConnection.panel && conn.panel.name === previousConnection.panel.name)
        //   .map(connection => connection.color)
        const allColors = colorsForPanel(connections, previousConnection.panel)
        notify(previousConnection.panel, allColors)
      } else {
        // const allColors = connections
        //   .filter(conn => conn.panel && conn.panel.name === panel.name)
        //   .map(connection => connection.color)
        const allColors = colorsForPanel(connections, panel)
        notify(panel, allColors)
      }
    })

    prevConnections = connections
  }

  // Begin polling
  setInterval(poll, POLL_MSEC);

  console.log('Ganglia Daemon is reborn!\n')
  console.log(`${colors.bold('Poll rate')}: ${1000 / POLL_MSEC} Hz`)
  console.log(`${colors.bold('Server')}: ${serverUrl}`)
})()
