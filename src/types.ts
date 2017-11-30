export type WireColor = 'red' | 'blue' | 'yellow'

export type WirePin = 3 | 5 | 7

export type Wire = { [C in WireColor]: WirePin }

export type Pin = number

export enum LightColor {
  red = 0xff0000,
  green = 0x00ff00,
  blue = 0x0000ff,
  yellow = 0xff9a00,
  purple = 800080
}

export type LightIndex = number

export type Light = {
  index: LightIndex
  color: LightColor
}
export abstract class Panel {
  readonly name: string
  readonly pins: Array<Pin>
  readonly lightIndicies: Array<LightIndex>
  abstract toData(colors: Array<WireColor>): any
  abstract toLights(colors: Array<WireColor>): Array<Light>
}

export type Connection = {
  color: WireColor
  panel: Panel | null
}

export type Event = {
  name: string
  data: object
}
