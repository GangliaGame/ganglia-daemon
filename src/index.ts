import { flatten } from 'lodash'
import * as colors from 'colors/safe'
import { Client } from './client'
import { panels } from './panels'
import { buttons } from './buttons'
import { Event, Light } from './types'
import { ButtonController } from './ButtonController'
import { PanelController } from './PanelController'
import { LightController } from './LightController'

(function main() {
  const serverUrl = process.env.GANGLIA_SERVER_URL || 'http://localhost:9000'
  const client = new Client(serverUrl)

  function onEvent(event: Event) {
    client.emit(event)
  }

  function onLights(lights: Light[]) {
    lightController.setLights(lights)
  }

  // Create a panel controller to manage plugging and unplugging wires into panels
  const panelController = new PanelController(panels, onEvent, onLights)

  // Create a button controller to manage button presses
  const buttonController = new ButtonController(buttons, onEvent)

  // Create a light controller
  const numLights = flatten(panels.map(p => p.lightIndicies)).length
  const lightController = new LightController(numLights)

  console.info('Ganglia Daemon is reborn!\n')
  console.info(`${colors.bold('Wire poll rate')}: ${1000 / panelController.pollRateMsec} Hz`)
  console.info(`${colors.bold('Button poll rate')}: ${1000 / buttonController.pollRateMsec} Hz`)
  console.info(`${colors.bold('Server')}: ${serverUrl}`)

  process.on('SIGINT', () => {
    lightController.teardown()
    process.nextTick(() => process.exit(0))
  })

})()
