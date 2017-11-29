import * as rpio from 'rpio'
import * as _ from 'lodash'

const POLL_MSEC = 250

type ColorPin = 3 | 5 | 7
const ColorWire = {
  red: 3,
  blue: 5,
  yellow: 7,
}

type WeaponPin = 11 | 13 | 15
const weaponPins: Array<WeaponPin> = [11, 13, 15]

// Set up color wires for writing
Object.values(ColorWire).forEach(pin => {
  rpio.open(pin, rpio.OUTPUT, rpio.LOW)
  rpio.pud(pin, rpio.PULL_DOWN);
})

// Set up weapon pins for reading
weaponPins.forEach(pin => rpio.open(pin, rpio.INPUT))

function portWireIsPluggedInto(color: ColorPin): WeaponPin | null {
  Object.values(ColorWire).forEach(pin => (
    rpio.write(pin, rpio.LOW)
  ))
  rpio.write(color, rpio.HIGH)
  return weaponPins.find(pin => Boolean(rpio.read(pin))) || null
}

let old = null
while (1) {
  const m = Object.entries(ColorWire).map(([name, pin]) => ({
    [name]: portWireIsPluggedInto(pin as ColorPin)
  }))
  if (!_.isEqual(old, m)) {
    console.log(m)
    old = m
  }
  rpio.msleep(POLL_MSEC)
}
