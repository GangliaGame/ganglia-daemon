import * as _ from 'lodash'
import { Light } from './types'
const ws281x = require('rpi-ws281x-native') // tslint:disable-line

export class LightController {

  public readonly numLights: number

  constructor(numLights: number) {
    this.numLights = numLights
    this.setup()
  }

  public setLights(lights: Light[]) {
    const pixelData = new Uint32Array(this.numLights)
    _.times(this.numLights, i => {
      const light = lights.find(({index}) => index === i)
      if (light) {
        pixelData[i] = light.color
      }
    })
    ws281x.render(pixelData)
  }

  public teardown(): void {
    console.info('tearing down lights')
  }

  private setup(): void {
    ws281x.init(this.numLights)
  }

}
