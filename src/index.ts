import * as rpio from 'rpio'
import * as _ from 'lodash'
import * as colors from 'colors/safe'

const clearConsole = () => process.stdout.write('\x1Bc')

const POLL_MSEC = 250

type ColorPin = 3 | 5 | 7
const ColorWire = {
  red: 3,
  blue: 5,
  yellow: 7,
}

type Pin = number
type Panel = {
  name: string
  pins: Array<Pin>
}
const panels: Array<Panel> = [
  {
    name: 'weapons',
    pins: [11, 13, 15],
  },
  {
    name: 'shields',
    pins: [19, 21, 23],
  },
  // {
  //   name: 'propulsion',
  //   pins: [8, 10],
  // },
  {
    name: 'regen',
    pins: [36, 38, 40],
  },
  {
    name: 'communications',
    pins: [16],
  },
]

// Set up color wires for writing
Object.values(ColorWire).forEach(pin => {
  rpio.open(pin, rpio.OUTPUT, rpio.LOW)
  rpio.pud(pin, rpio.PULL_DOWN);
})

// Set up all pins for reading
_.flatten(_.map(panels, 'pins')).forEach(pin => rpio.open(pin, rpio.INPUT))

function panelWireIsPluggedInto(color: ColorPin): Panel | null {
  Object.values(ColorWire).forEach(pin => (
    rpio.write(pin, rpio.LOW)
  ))
  rpio.write(color, rpio.HIGH)
  const panel = _.find(panels, ({name, pins}) => {
    return pins.some(pin => Boolean(rpio.read(pin)))
  })
  return panel || null
}

console.log(`polling every ${colors.bold(String(POLL_MSEC))} ms`)

let old = null
while (1) {
  const m = Object.entries(ColorWire).map(([colorName, pin]) => {
    const panel = panelWireIsPluggedInto(pin as ColorPin)
    return {
      color: colorName,
      state: panel ? panel.name : null,
    }
  })
  if (!_.isEqual(old, m)) {
    clearConsole()
    m.forEach(({color, state}) => {
      let colorFn: Function
      if (color === 'red') colorFn = colors.red
      else if (color === 'yellow') colorFn = colors.yellow
      else if (color === 'blue') colorFn = colors.blue
      else colorFn = console.log
      console.log(`${colorFn(color)} => ${state}`)
    })
    old = m
  }
  rpio.msleep(POLL_MSEC)
}
