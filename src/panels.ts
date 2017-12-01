import * as _ from 'lodash'
import { WireColor, Light, Panel, LightColor } from './types'

class WeaponsPanel implements Panel {
  public readonly name = 'weapons'
  public readonly pins = [11, 13, 15]
  public lights: Light[] = []
  public readonly lightIndicies = [0, 1, 2]

  public toData(colors: WireColor[]) {
    return colors
  }

  public updateLights(colors: WireColor[]): void {
    this.lights = colors.map((color, i) => ({
      index: this.lightIndicies[i],
      color: LightColor[color],
    }))
  }
}

class ShieldsPanel implements Panel {
  public readonly name = 'shields'
  public readonly pins = [19, 21, 23]
  public lights: Light[] = []
  public readonly lightIndicies = [5, 3, 4] // hardware is reversed

  public toData(colors: WireColor[]) {
    return colors
  }

  public updateLights(colors: WireColor[]): void {
    colors.reverse()
    this.lights = colors.map((color, i) => ({
      index: this.lightIndicies[i],
      color: LightColor[color],
    }))
  }
}

class PropulsionPanel implements Panel {
  public readonly name = 'propulsion'
  public readonly pins = [35, 37]
  public lights: Light[] = []
  public readonly lightIndicies = [6, 7]

  public toData(colors: WireColor[]) {
    return colors.length
  }

  public updateLights(colors: WireColor[]) {
    this.lights = _.times(colors.length, i => ({
      index: this.lightIndicies[i],
      color: LightColor.purple,
    }))
  }
}

class RepairsPanel implements Panel {
  public readonly name = 'repairs'
  public readonly pins = [36, 38, 40]
  public lights: Light[] = []
  public readonly lightIndicies = [8, 9, 10]

  public toData(colors: WireColor[]) {
    return colors.length
  }

  public updateLights(colors: WireColor[]): void {
    this.lights = _.times(colors.length, i => ({
      index: this.lightIndicies[i],
      color: LightColor.green,
    }))
  }
}

class CommunicationsPanel implements Panel {
  public readonly name = 'communications'
  public readonly pins = [27]
  public lights: Light[] = []
  public readonly lightIndicies = [11]

  public toData(colors: WireColor[]) {
    return colors.length > 0
  }

  public updateLights(colors: WireColor[]): void {
    this.lights = _.times(colors.length, i => ({
      index: this.lightIndicies[i],
      color: LightColor.red,
    }))
  }
}

const panels: Panel[] = [
  new WeaponsPanel(),
  new ShieldsPanel(),
  new PropulsionPanel(),
  new RepairsPanel(),
  new CommunicationsPanel(),
]

export { panels }
