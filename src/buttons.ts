import { Button, ButtonState } from './types'

export const buttons: Button[] = [
  {
    name: 'fire',
    pin: 8,
    toData: (state: ButtonState) => state === 'pressed' ? 'start' : 'stop',
  },
  {
    name: 'move-up',
    pin: 16,
    toData: (state: ButtonState) => state === 'pressed' ? 'start' : 'stop',
  },
  {
    name: 'move-down',
    pin: 18,
    toData: (state: ButtonState) => state === 'pressed' ? 'start' : 'stop',
  },
]
