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
  const client = new Client(process.env.GANGLIA_SERVER_URL || 'http://localhost:9000')

  // Create a panel controller to manage plugging and unplugging wires into panels
  const panelController = new PanelController(panels, onEvent)

  // Create a button controller to manage button presses
  const buttonController = new ButtonController(buttons, onEvent)

  // Create a light controller
  const numLights = flatten(panels.map(p => p.lightIndicies)).length
  const lightController = new LightController(numLights)

  // Update lights (all at once, since they are daisy-chained via PWM)
  function updateLights() {
    const allLights = flatten(panelController.panels.map(panel => panel.lights))
    lightController.setLights(allLights)
  }

  // Dispatch event to client and update other state as needed
  function onEvent(event: Event) {
    //
    function colorize(data: any): any {
      if (typeof data !== typeof Array) {
        return data
      }
      return data.map((datum: any) => {
        if (typeof datum !== typeof String) {
          return datum
        }
        if (datum === 'red') {
          return colors.red(datum)
        }
        if (datum === 'yellow') {
          return colors.yellow(datum)
        }
        if (datum === 'blue') {
          return colors.blue(datum)
        }
      })
    }
    console.info(`${event.name} => ${colorize(event.data)}`)
    client.emit(event)
    updateLights()
  }

  console.info(`\n${colors.bold('Wire poll rate')}: ${1000 / panelController.pollRateMsec} Hz`)
  console.info(`${colors.bold('Button poll rate')}: ${1000 / buttonController.pollRateMsec} Hz`)
  console.info(`${colors.bold('Server')}: ${client.url}\n`)
  console.info(`${colors.cyan('Ganglia Daemon is reborn!\n')}`)

  process.on('SIGINT', () => {
    lightController.teardown()
    process.nextTick(() => process.exit(0))
  })

})()
