import {Gpio, type High, type Low} from 'onoff'

export const ring = (ringerWire: string, ringerPin: number) => {
  const ringer = new Gpio(ringerPin, 'out')

  const steps = ringerWire.split(',').map(x => parseInt(x))

  let action: High | Low = 0
  let count = 0
  ringer.writeSync(1)
  steps.forEach(step => {
    setTimeout(
      () => {
        ringer.writeSync(action)
        action = action === 1 ? 0 : 1
      },
      step * 1000 + count * 1000
    )
    count += step
  })
  setTimeout(() => ringer.unexport(), count * 1000)
}
