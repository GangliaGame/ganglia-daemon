import * as _ from 'lodash'
import * as rpio from 'rpio'
import { WirePin, WireColor, Wire, Panel, Connection, Event } from './types'

const wires: Wire = {
  red: 3,
  blue: 5,
  yellow: 7,
}

type EventHandler = (event: Event) => void

export class PanelController {

  public readonly pollRateMsec: number
  public readonly panels: Panel[] = []
  public readonly onEvent: EventHandler
  private prevConnections: Connection[] = []

  constructor(panels: Panel[], eventHandler: EventHandler, pollRateMsec = 250) {
    this.pollRateMsec = pollRateMsec
    this.onEvent = eventHandler
    this.panels = panels
    this.setup()

    // Begin polling for wire connections
    setInterval(this.poll.bind(this), pollRateMsec)
  }

  private setup(): void {
    // Set up wire pins for writing
    Object.values(wires).forEach(pin => {
      rpio.open(pin, rpio.OUTPUT, rpio.LOW)
      rpio.pud(pin, rpio.PULL_DOWN)
    })

    // Set up all panel pins for reading
    _.flatten(_.map(this.panels, 'pins')).forEach(pin => {
      rpio.open(pin, rpio.INPUT)
      rpio.pud(pin, rpio.PULL_DOWN)
    })
  }

  // Returns the colors of the wires plugged into panel
  private colorsForPanel(connections: Connection[], panel: Panel | null): WireColor[] {
    return _.sortBy(connections, 'position')
      .filter(conn => conn.panel && panel && conn.panel.name === panel.name)
      .map(connection => connection.color)
  }

  private poll() {
    const connections = this.getConnections()
    const newConnections = _.differenceWith(connections, this.prevConnections, _.isEqual)

    // If there were no new connections, just return early
    if (_.isEmpty(newConnections)) {
      return
    }

    console.log(JSON.stringify(newConnections, null, 2))

    // Dispatch server events and change lights based on new connections
    newConnections.forEach(({color, panel}) => {
      let panelToUse: Panel
      if (panel) {
        // Connection added, use the panel it was added to
        panelToUse = panel
      } else {
        // Connection removed, find the panel it was previously connected to and remove it
        const previousConnection = this.prevConnections.find((conn: Connection) => conn.color === color)
        // If the previous connection doesn't exist, it's because
        // it was plugged in before the daemon was started. That's fine,
        // just skip it!
        if (!previousConnection) {
          return
        }
        console.log(previousConnection)
        panelToUse = previousConnection.panel!
      }
      const allColors = this.colorsForPanel(connections, panelToUse)
      const event = this.eventForPanelWithColors(panelToUse, allColors)
      panelToUse.updateLights(allColors)
      this.onEvent(event)
    })

    this.prevConnections = connections
  }

  // Create an event based on the panel and wires
  private eventForPanelWithColors(panel: Panel, colors: WireColor[]): Event {
    return {
      name: panel.name,
      data: panel.toData(colors),
    }
  }

  private whereIsWirePluggedIn(pin: WirePin): {position: number | null, panel: Panel | null} {
    // Set all wire pins to LOW
    Object.values(wires).forEach(w => rpio.write(w, rpio.LOW))
    // Set the we're testing in to HIGH
    rpio.write(pin, rpio.HIGH)
    // Find the panel that the wire is plugged in and what position it is in (i.e. order)
    let position = null
    const panel = _.find(this.panels, ({name, pins}) => {
      return pins.some((p, i) => {
        position = i
        return Boolean(rpio.read(p))
      })
    }) || null
    return { panel, position }
  }

  private getConnections(): Connection[] {
    return _.map(wires, (pin: WirePin, color: WireColor) => {
      const { panel, position } = this.whereIsWirePluggedIn(pin)
      return { color, panel, position }
    })
  }

}
