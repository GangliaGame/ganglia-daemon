import * as _ from 'lodash'
import { Panel, ColorPosition, Light, LightColor } from './types'
import * as rpio from 'rpio'

class WeaponsPanel extends Panel {
  public readonly name = 'weapons'
  public readonly pins = [11, 13, 15]
  public lights: Light[] = []
  public readonly lightIndicies = [0, 1, 2]
  public readonly buttonLightPins = [24]

  public toData(colorPositions: ColorPosition[]) {
    return _.map(colorPositions, 'color')
  }

  public update(colorPositions: ColorPosition[]): void {
    const isButtonLit = colorPositions.length > 0
    _.forEach(this.buttonLightPins, pin => {
      rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW)
    })
    // Set LED lights for later batch-update
    this.lights = colorPositions
      .filter(({position}) => position !==  null)
      .map(({color, position}) => ({
        index: this.lightIndicies[position!],
        color: LightColor[color],
      }))
  }
}

class ShieldsPanel extends Panel {
  public readonly name = 'shields'
  public readonly pins = [19, 21, 23]
  public lights: Light[] = []
  public readonly lightIndicies = [5, 4, 3] // LEDs were installed backwards

  public toData(colorPositions: ColorPosition[]) {
    return _.map(colorPositions, 'color')
  }

  public setButtonLight(colorPositions: ColorPosition[]) {
    return
  }

  public update(colorPositions: ColorPosition[]): void {
    this.lights = colorPositions
      .filter(({position}) => position !==  null)
      .map(({color, position}) => ({
        index: this.lightIndicies[position!],
        color: LightColor[color],
      }))
  }
}
//
// class PropulsionPanel extends Panel {
//   public readonly name = 'propulsion'
//   public readonly pins = [33, 35]
//   public lights: Light[] = []
//   public readonly lightIndicies = [6, 7]
//   public readonly buttonLightPins = [26, 28]
//
//   public toData(colorPositions: ColorPosition[]) {
//     return colorPositions.length
//   }
//
//   public update(colorPositions: ColorPosition[]) {
//     const isButtonLit = colorPositions.length > 0
//     _.forEach(this.buttonLightPins, pin => {
//       rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW)
//     })
//
//     this.lights = _.times(colorPositions.length, i => ({
//       index: this.lightIndicies[i],
//       color: LightColor.purple,
//     }))
//   }
// }
//
// class RepairsPanel extends Panel {
//   public readonly name = 'repairs'
//   public readonly pins = [27, 29, 31]
//   public lights: Light[] = []
//   public readonly lightIndicies = [10, 9, 8] // LEDs were installed backwards
//
//   public toData(colorPositions: ColorPosition[]) {
//     return colorPositions.length
//   }
//
//   public update(colorPositions: ColorPosition[]): void {
//     this.lights = _.times(colorPositions.length, i => ({
//       index: this.lightIndicies[i],
//       color: LightColor.green,
//     }))
//   }
// }
//
// class CommunicationsPanel extends Panel {
//   public readonly name = 'communications'
//   public readonly pins = [37]
//   public lights: Light[] = []
//   public readonly lightIndicies = [11]
//
//   public toData(colorPositions: ColorPosition[]) {
//     return colorPositions.length > 0
//   }
//
//   public update(colorPositions: ColorPosition[]): void {
//     this.lights = _.times(colorPositions.length, i => ({
//       index: this.lightIndicies[i],
//       color: LightColor.red,
//     }))
//   }
// }

const panels: Panel[] = [
  new WeaponsPanel(),
  new ShieldsPanel(),
  // new PropulsionPanel(),
  // new RepairsPanel(),
  // new CommunicationsPanel(),
]

export { panels }
