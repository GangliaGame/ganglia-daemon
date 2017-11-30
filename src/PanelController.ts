import * as _ from 'lodash'
import * as rpio from 'rpio'
import { WirePin, WireColor, Light, Wire, Panel, Connection, Event } from './types'

const wires: Wire = {
  red: 3,
  blue: 5,
  yellow: 7,
}

export class PanelController {

  public readonly pollRateMsec: number
  public readonly panels: Panel[]
  public readonly onEvent: (event: Event) => void
  public readonly onLights: (lights: Light[]) => void
  private prevConnections: Connection[]

  constructor(
    panels: Panel[],
    eventHandler: (event: Event) => void,
    lightsHandler: (lights: Light[]) => void,
    pollRateMsec = 250,
  ) {
    this.pollRateMsec = pollRateMsec
    this.onEvent = eventHandler
    this.onLights = lightsHandler
    this.panels = panels
    this.setup()

    // Begin polling for wire connections
    setInterval(this.poll, pollRateMsec)
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
    return connections
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

    // Dispatch server events and change lights based on new connections
    newConnections.forEach(({color, panel}) => {
      let panelToUse: Panel
      if (panel) {
        // Connection added, use the panel it was added to
        panelToUse = panel
      } else {
        // Connection removed, find the panel it was previously connected to and remove it
        const previousConnection = this.prevConnections.find((conn: Connection) => conn.color === color) as Connection
        panelToUse = previousConnection.panel!
      }
      const allColors = this.colorsForPanel(connections, panelToUse)
    // Create a serialized event for every new connection we just discovered
      const event = this.eventForPanelWithColors(panelToUse, allColors)
      const lights: Light[] = panel.toLights(allColors)
      this.onEvent(event)
      this.onLights(lights)
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

  private panelWireIsPluggedInto(pin: WirePin): Panel | null {
    // Set all wire pins to LOW
    Object.values(wires).forEach(p => rpio.write(p, rpio.LOW))
    // Set the we're testing in to HIGH
    rpio.write(pin, rpio.HIGH)
    // Find the panel that the wire is plugged into
    const panel = _.find(this.panels, ({name, pins}) => {
      return pins.some(p => Boolean(rpio.read(p)))
    })
    return panel || null
  }

  private getConnections(): Connection[] {
    return _.map(wires, (pin: WirePin, color: WireColor) => {
      const panel = this.panelWireIsPluggedInto(pin)
      return { color, panel }
    })
  }

}
