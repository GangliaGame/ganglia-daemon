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
  function eventForPanelWithColors(panel: Panel, colors: Array<WireColor>): Event {
    console.log('will emit:')
    console.log(panel.name, panel.toData(colors))
    return {
      name: panel.name,
      data: panel.toData(colors),
    }
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

    // Create a serialized event for every new connection we just discovered
    const events = newConnections.map(({color, panel}: {color: WireColor, panel: Panel}) => {
      // Connection added to panel
      if (panel) {
        const allColors = colorsForPanel(connections, panel)
        return eventForPanelWithColors(panel, allColors)
      }
      // Connection removed, find the panel it was previously connected to and remove it
      const previousConnection = prevConnections.find((conn: Connection) => conn.color === color)
      // Sanity check — this will never happen.
      if (!previousConnection || !previousConnection.panel) return
      const allColors = colorsForPanel(connections, previousConnection.panel)
      return eventForPanelWithColors(previousConnection.panel, allColors)
    })

    prevConnections = connections
  }

  // Begin polling
  setInterval(poll, POLL_MSEC);

  console.log('Ganglia Daemon is reborn!\n')
  console.log(`${colors.bold('Poll rate')}: ${1000 / POLL_MSEC} Hz`)
  console.log(`${colors.bold('Server')}: ${serverUrl}`)
})()
