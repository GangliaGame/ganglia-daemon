import * as rpio from 'rpio'
import * as _ from 'lodash'
import * as io from 'socket.io-client'
import * as colors from 'colors/safe'

const socket = io('http://localhost:9000')

const clearConsole = () => process.stdout.write('\x1Bc')

const POLL_MSEC = 250

type WireColor = 'red' | 'blue' | 'yellow'
type WirePin = 3 | 5 | 7
type Wire = { [C in WireColor]: WirePin }

const wires: Wire = {
  red: 3,
  blue: 5,
  yellow: 7,
}

type Pin = number
type Panel = {
  name: string
  pins: Array<Pin>
  toData: (colors: Array<WireColor>) => any
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
  // {
  //   name: 'propulsion',
  //   pins: [8, 10],
  //   toData: colors => colors.length
  // },
  {
    name: 'regen',
    pins: [36, 38, 40],
    toData: colors => colors.length
  },
  {
    name: 'communications',
    pins: [16],
    toData: colors => colors.length > 0
  },
]

// Set up color wires for writing
Object.values(wires).forEach(pin => {
  rpio.open(pin, rpio.OUTPUT, rpio.LOW)
  rpio.pud(pin, rpio.PULL_DOWN);
})

// Set up all pins for reading
_.flatten(_.map(panels, 'pins')).forEach(pin => rpio.open(pin, rpio.INPUT))

function panelWireIsPluggedInto(pin: WirePin): Panel | null {
  // Set all wire pins to LOW
  Object.values(wires).forEach(p => rpio.write(p, rpio.LOW))
  // Set the one we're testing to HIGH
  rpio.write(pin, rpio.HIGH)
  // Find the panel that the wire is plugged into
  const panel = _.find(panels, ({name, pins}) => {
    return pins.some(p => Boolean(rpio.read(p)))
  })
  return panel || null
}

console.log(`polling every ${colors.bold(String(POLL_MSEC))} ms`)

type Assignment = {
  color: WireColor
  panel: Panel | null
}

function printAssignments(assignments: Array<Assignment>) {
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
  events(assignments).forEach(({name, data}) => socket.emit(name, data))
}

const mockAssignments: Array<Assignment> = [
  {
    color: 'red',
    panel: panels[0],
  },
  {
    color: 'blue',
    panel: panels[2],
  },
  {
    color: 'yellow',
    panel: panels[1],
  },
]

let assignments: Array<Assignment> = []
while (1) {
  const newAssignments = _.map(wires, (pin, color: WireColor) => {
    const panel = panelWireIsPluggedInto(pin as WirePin)
    return { color, panel }
  })
  if (!_.isEqual(assignments, newAssignments)) {
    assignments = newAssignments
    printAssignments(assignments)
    dispatchEvents(mockAssignments)
  }
  rpio.msleep(POLL_MSEC)
}
socket.on('connect', () => {
  console.log('connected!')
})
// socket.on('event', data => {
//
// })
socket.on('disconnect', () => {
  console.log('disconnected!')

})
