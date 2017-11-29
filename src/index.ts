import * as rpio from 'rpio'

const POLL_MSEC = 250

enum ColorWire {
  red = 3,
  blue = 5,
  yellow = 7,
}

type WeaponPin = 11 | 13 | 15
const weaponPins: Array<WeaponPin> = [11, 13, 15]

// Set up color wires for writing
rpio.open(ColorWire.red, rpio.OUTPUT, rpio.LOW)
rpio.open(ColorWire.blue, rpio.OUTPUT, rpio.LOW)
rpio.open(ColorWire.yellow, rpio.OUTPUT, rpio.LOW)

// Set up weapon pins for reading
weaponPins.forEach(pin => rpio.open(pin, rpio.INPUT))

function checkColor(color: ColorWire): WeaponPin | null {
  rpio.write(ColorWire.red, rpio.LOW)
  rpio.write(ColorWire.blue, rpio.LOW)
  rpio.write(ColorWire.yellow, rpio.LOW)
  rpio.write(color, rpio.HIGH)
  return weaponPins.find(pin => Boolean(rpio.read(pin))) || null
}

while (1) {
  [3,5,7].forEach((color: ColorWire) => {
    const colorPin = checkColor(color)
    console.log(`red: ${colorPin}`)
  })
  rpio.msleep(POLL_MSEC)
}