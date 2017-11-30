import * as _ from 'lodash'
import { WireColor, Pin, Light, Panel, LightColor, LightIndex } from './types'

class WeaponsPanel implements Panel {
  name = 'weapons'
  pins = [11, 13, 15]
  lightIndicies: [0, 1, 2]

  toData(colors: Array<WireColor>) {
    return colors
  }

  toLights(colors: Array<WireColor>): Array<Light> {
    return colors.map((color, i) => ({
      index: this.lightIndicies[i],
      color: LightColor[color]
    }))
  }
}

class ShieldsPanel implements Panel {
  name = 'shields'
  pins = [19, 21, 23]
  lightIndicies: [0, 1, 2]

  toData(colors: Array<WireColor>) {
    return colors
  }

  toLights(colors: Array<WireColor>): Array<Light> {
    return colors.map((color, i) => ({
      index: this.lightIndicies[i],
      color: LightColor[color]
    }))
  }
}

class PropulsionPanel implements Panel {
  name = 'propulsion'
  pins = [35, 37]
  lightIndicies: [0, 1, 2]

  toData(colors: Array<WireColor>) {
    return colors.length
  }

  toLights(colors: Array<WireColor>) {
    return []
  }
}

class RepairsPanel implements Panel {
  name = 'repairs'
  pins = [36, 38, 40]
  lightIndicies: [0, 1, 2]

  toData(colors: Array<WireColor>) {
    return colors.length
  }

  toLights(colors: Array<WireColor>) {
    return []
  }
}

class CommunicationsPanel implements Panel {
  name = 'communications'
  pins = [27]
  lightIndicies: [0, 1, 2]

  toData(colors: Array<WireColor>) {
    return colors.length > 0
  }

  toLights(colors: Array<WireColor>) {
    return []
  }
}

const panels: Array<Panel> = [
  new WeaponsPanel,
  new ShieldsPanel,
  new PropulsionPanel,
  new RepairsPanel,
  new CommunicationsPanel,
]

export { panels }
