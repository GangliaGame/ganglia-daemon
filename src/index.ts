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

function getEvents(assignments: Array<Connection>): Array<Event> {
  return _.chain(assignments)
    .filter(({panel}) => panel !== null)
    .groupBy(({panel}) => panel!.name)
    .map((a, name) => ({
        name,
        toData: a[0].panel!.toData,
        colors: _.map(a, 'color'),
    }))
    .map(({name, toData, colors}) => ({
      name,
      data: toData(colors)
    }))
    .value()
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
  let connections: Array<Connection> = getConnections()
  function poll() {
    const newConnections = getConnections()
    const diff = _.difference(connections, newConnections)
    console.log(diff)
    connections = newConnections
  }

  // Begin polling
  setInterval(poll, POLL_MSEC);

  console.log('Ganglia Daemon is reborn!\n')
  console.log(`${colors.bold('Poll rate')}: ${1000 / POLL_MSEC} Hz`)
  console.log(`${colors.bold('Server')}: ${serverUrl}`)
})()
