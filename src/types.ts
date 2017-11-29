export type WireColor = 'red' | 'blue' | 'yellow'

export type WirePin = 3 | 5 | 7

export type Wire = { [C in WireColor]: WirePin }

export type Connection = {
  color: WireColor
  panel: Panel | null
}

export type Pin = number

export type Panel = {
  name: string
  pins: Array<Pin>
  toData: (colors: Array<WireColor>) => any
}

export type Event = {
  name: string
  data: object
}
