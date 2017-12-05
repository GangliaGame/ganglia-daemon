import { flatten } from 'lodash'
import * as colors from 'colors/safe'
import { Client } from './client'
import { panels } from './panels'
import { buttons } from './buttons'
import { Event } from './types'
import { ButtonController } from './ButtonController'
import { PanelController } from './PanelController'
import { LightController } from './LightController'

(function main() {
  // Create a client to interact with the server
  const client = new Client(process.env.GANGLIA_SERVER_URL || 'http://server.toomanycaptains.com')

  // Create a panel controller to manage plugging and unplugging wires into panels
  const panelController = new PanelController(panels, onEvent)

  // Create a button controller to manage button presses
  const buttonController = new ButtonController(buttons, onEvent)

  // Create a light controller for the wire/panel LEDs
  const numLights = flatten(panels.map(p => p.lightIndicies)).length
  const lightController = new LightController(numLights)

  // Update lights (all at once, since they are daisy-chained via PWM)
  function updatePanelLights() {
    const allLights = flatten(panelController.panels.map(panel => panel.lights))
    lightController.setLights(allLights)
  }

  // Dispatch event to client and update other state as needed
  function onEvent(event: Event) {
    console.info(`${event.name} => ${event.data}`)
    client.emit(event)
    updatePanelLights()
  }

  console.info(`\n${colors.bold('Wire poll rate')}: ${1000 / panelController.pollRateMsec} Hz`)
  console.info(`${colors.bold('Button poll rate')}: ${1000 / buttonController.pollRateMsec} Hz`)
  console.info(`${colors.bold('Server')}: ${client.url}\n`)

  function teardownAndExitCleanly() {
    lightController.teardown()
    process.nextTick(() => process.exit(0))
  }

  process.on('SIGINT', teardownAndExitCleanly)
  process.on('SIGTERM', teardownAndExitCleanly)
})()
