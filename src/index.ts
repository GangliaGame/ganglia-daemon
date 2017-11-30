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

function printConnections(assignments: Array<Connection>) {
  console.log('\n')
  assignments.forEach(({color, panel}) => {
    let colorFn: Function
    if (color === 'red') colorFn = colors.red
    else if (color === 'yellow') colorFn = colors.yellow
    else if (color === 'blue') colorFn = colors.blue
    else colorFn = console.log
    console.log(`${colorFn(color)} => ${panel ? panel.name : ''}`)
  })
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

  // Periodically check for new connections
  let prevConnections: Array<Connection> = getConnections()
  function poll() {
    const connections = getConnections()
    const newConnections: Array<Connection> = _.differenceWith(prevConnections, connections, _.isEqual)

    // If there were no new connections, just return early
    if (_.isEmpty(newConnections)) return

    console.log(newConnections)
    newConnections.map(({color, panel}: {color: WireColor, panel: Panel}) => {
      if (panel === null) {
        const previousConnection: Connection | undefined = prevConnections.find((conn: Connection) => conn.color === color)
        console.log('previousConnection')
        console.log(previousConnection)
        if (previousConnection && previousConnection.panel) {
          console.log(`unplug ${color} from previous panel, which was ${previousConnection.panel.name}`)
        } else {
          console.warn('wire unplugged with invalid previous connection, this is a no-op')
        }
      } else {
        // console.log(`plug ${color} into panel ${panel.name}`)
        // console.log('connections')
        // console.log(connections)
        const allColors = connections
          .filter(connection => (
            connection.panel && connection.panel.name === panel.name
          ))
          .map(connection => connection.color);
        client.emit(panel.name, panel.toData(allColors))
        // console.log('will emit:')
        // console.log(panel.name, panel.toData(allColors))
        // const event = pane
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
