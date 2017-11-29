import * as rpio from 'rpio'
import * as _ from 'lodash'
import * as io from 'socket.io-client'
import * as colors from 'colors/safe'

const SERVER_URL = process.env.GANGLIA_SERVER_URL || 'http://localhost:9000'
const POLL_MSEC = 250

console.log('Ganglia Daemon is reborn!\n')
console.log(`${colors.bold('Poll rate')}: ${1000 / POLL_MSEC} Hz`)
console.log(`${colors.bold('Server')}: ${SERVER_URL}`)
const socket = io(SERVER_URL, { reconnection: true })

type WireColor = 'red' | 'blue' | 'yellow'
type WirePin = 3 | 5 | 7
type Wire = { [C in WireColor]: WirePin }

type Assignment = {
  color: WireColor
  panel: Panel | null
}

type Pin = number
type Panel = {
  name: string
  pins: Array<Pin>
  toData: (colors: Array<WireColor>) => any
}

const wires: Wire = {
  red: 3,
  blue: 5,
  yellow: 7,
}

const panels: Array<Panel> = [
  {
    name: 'weapons',
    pins: [11, 13, 15],
    toData: colors => colors
  },
  {
    name: 'shields',
    pins: [19, 21, 23],
    toData: colors => colors
  },
  {
    name: 'propulsion',
    pins: [35, 37],
    toData: colors => colors.length
  },
  {
    name: 'regen',
    pins: [36, 38, 40],
    toData: colors => colors.length
  },
  {
    name: 'communications',
    pins: [27],
    toData: colors => colors.length > 0
  }
]

// Set up color wires for writing
Object.values(wires).forEach(pin => {
  rpio.open(pin, rpio.OUTPUT, rpio.LOW)
  rpio.pud(pin, rpio.PULL_DOWN);
})

// Set up all pins for reading
_.flatten(_.map(panels, 'pins')).forEach(pin => {
  rpio.open(pin, rpio.INPUT)
  rpio.pud(pin, rpio.PULL_DOWN);
})

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

function printAssignments(assignments: Array<Assignment>) {
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

type Event = {
  name: string,
  data: object,
}

function events(assignments: Array<Assignment>): Array<Event> {
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

function dispatchEvents(assignments: Array<Assignment>): void {
  const es = events(assignments)
  // console.log(es)
  // forEach(({name, data}) => socket.emit(name, data))
}

let assignments: Array<Assignment> = []
function poll() {
  const newAssignments = _.map(wires, (pin, color: WireColor) => {
    const panel = panelWireIsPluggedInto(pin as WirePin)
    return { color, panel }
  })
  if (!_.isEqual(assignments, newAssignments)) {
    _.zip(assignments, newAssignments)
    .filter(([prev, cur]) => cur.panel === null)
    .map(([prev, cur]) => {
      console.log(prev.panel!.name, ' unplugged')
    })
    // d.forEach(({color, panel}) => {
    //   if (panel === null) {
    //     console.log(`${panel} now empty`)
    //   }
    // })
    assignments = newAssignments
    printAssignments(assignments)
    dispatchEvents(assignments)
  }
}

setInterval(poll, POLL_MSEC)

socket.on('connect', () => {
  console.log('Connected to server')
})

socket.on('disconnect', () => {
  console.warn('Disconnected from server')
})
