import * as _ from 'lodash'
import { Light } from './types'
const ws281x = require('rpi-ws281x-native') // tslint:disable-line

export class LightController {

  public readonly numLights: number
  private readonly lights: Light[] = []

  constructor(numLights: number) {
    this.numLights = numLights
    this.setup()
  }

  public addLights(lights: Light[]): void {
    this.lights.push(...lights)
    this.updateLights()
  }

  public removeLights(lights: Light[]): void {
    console.log('removing lights', lights)
    _.pullAllBy(this.lights, lights, 'index')
    this.updateLights()
  }

  public teardown(): void {
    ws281x.reset()
  }

  private updateLights() {
    const pixelData = new Uint32Array(this.numLights)
    _.times(this.numLights, i => {
      const light = this.lights.find(({index}) => index === i)
      if (light) {
        pixelData[i] = light.color
      }
    })
    ws281x.render(pixelData)
  }

  private setup(): void {
    ws281x.init(this.numLights)
  }

}
