import * as rpio from 'rpio'
import * as _ from 'lodash'

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

let old = null
while (1) {
  const m = Object.entries(ColorWire).map(([name, pin]) => {
    const panel = panelWireIsPluggedInto(pin as ColorPin)
    if (panel) {
      return { [name]: panel.name }
    } else {
      return  { [name]: null }
    }
  })
  if (!_.isEqual(old, m)) {
    console.log(m)
    old = m
  }
  rpio.msleep(POLL_MSEC)
}
