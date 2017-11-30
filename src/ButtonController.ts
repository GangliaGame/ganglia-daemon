import * as rpio from 'rpio'
import * as _ from 'lodash'
import { Button, ButtonState, Event, Press } from './types'

function isButtonPressed(button: Button): boolean {
  return rpio.read(button.pin) ? false : true
}

export class ButtonController {

  public readonly pollRateMsec: number
  public readonly buttons: Button[]
  public readonly onEvent: (event: Event) => void
  private prevPresses: Press[] = []

  constructor(buttons: Button[], eventHandler: (event: Event) => void, pollRateMsec = 50) {
    this.pollRateMsec = pollRateMsec
    this.onEvent = eventHandler
    this.buttons = buttons
    this.setup()

    // Begin polling for button connections
    setInterval(this.poll.bind(this), pollRateMsec)
  }

  private setup(): void {
    // Set up button pins for reading
    this.buttons.forEach(({pin}) => {
      rpio.open(pin, rpio.INPUT, rpio.PULL_UP)
    })
  }

  private poll(): void {
    const presses = this.getPresses()
    const newPresses: Press[] = _.differenceWith(presses, this.prevPresses, _.isEqual)

    // If there were no new presses, just return early
    if (_.isEmpty(newPresses)) {
      return
    }

    const events = newPresses.map(({button, state}) => ({
      name: button.name,
      data: button.toData(state),
    }))

    // dispatch events
    events.forEach(event => this.onEvent(event))

    this.prevPresses = presses
  }

  private getPresses(): Press[] {
    return this.buttons.map(button => {
      const isPressed = isButtonPressed(button)
      return {
        button,
        state: (isPressed ? 'pressed' : 'released') as ButtonState,
      }
    })
  }

  }
