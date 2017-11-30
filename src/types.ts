export type WireColor = 'red' | 'blue' | 'yellow'

export type WirePin = 3 | 5 | 7

export type Wire = { [C in WireColor]: WirePin }

export type Pin = number

export enum LightColor {
  red = 0xff0000,
  green = 0x00ff00,
  blue = 0x0000ff,
  yellow = 0xff9a00,
  orange = 0xffa500,
  purple = 0x800080,
}

export type LightIndex = number

export interface Light {
  index: LightIndex
  color: LightColor
}

export abstract class Panel {
  public readonly name: string
  public readonly pins: Pin[]
  public readonly lightIndicies: LightIndex[]
  public abstract toData(colors: WireColor[]): any
  public abstract toLights(colors: WireColor[]): Light[]
}

export interface Connection {
  color: WireColor
  panel: Panel | null
}

export interface Event {
  name: string
  data: object
}

export type ButtonState = 'pressed' | 'released'

export interface Button {
  name: string
  pin: Pin
  toData: (state: ButtonState) => any
}

export interface Press {
  button: Button
  state: ButtonState
}

// export abstract class PolledController<T, E> {
//   public readonly pollRateMsec: number
//   public readonly onEvent: (event: Event) => void
//   protected abstract poll(): void
//   protected abstract setup(): void
//
//   constructor(objects: T[], )
// }
