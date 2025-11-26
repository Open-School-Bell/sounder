import {Gpio, type High, type Low} from 'onoff'

import {log} from './log'

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const ring = async (
  ringerWire: string,
  ringerPin: number,
  repeat: number = 1
) => {
  await log(`🎚️ Ringer Wire: ${ringerWire}`)

  if (repeat > 1) {
    let playCount = 1
    while (playCount < repeat) {
      await ring(ringerWire, ringerPin)
      playCount += 1
    }
  }

  const steps = ringerWire.split(',').map(x => parseFloat(x))

  let action: High | Low = 1
  let count = 0

  const ringer = new Gpio(ringerPin, 'out')
  const stepCount = steps.length

  while (count < stepCount) {
    ringer.writeSync(action)
    await sleep(steps.shift()! * 1000)
    count += 1
    action = action === 1 ? 0 : 1
  }

  ringer.writeSync(0)
  ringer.unexport()

  return
}
