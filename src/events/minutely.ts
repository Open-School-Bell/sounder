import {sounderApi} from '../utils/sounder-api'
import {log} from '../utils/log'
import {VERSION} from '../constants'
import {getPrisma, getSettings} from '../utils/prisma'
import {enqueue, processQueue} from '../utils/play-queue'

export const minutely = async () => {
  const date = new Date()
  const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  const dayNumber = `${date.getDay() === 0 ? 7 : date.getDay()}`

  const prisma = getPrisma()

  const {
    currentDay,
    lockdownEnable,
    lockdownInterval,
    lockdownEntrySound,
    lockdownTimes,
    lockdownRepeatRingerWire
  } = await getSettings([
    'currentDay',
    'lockdownEnable',
    'lockdownInterval',
    'lockdownEntrySound',
    'lockdownTimes',
    'lockdownRepeatRingerWire',
    'sounderPin'
  ])

  await sounderApi('/ping', {version: VERSION})

  if (lockdownEnable) {
    if (date.getMinutes() % lockdownInterval === 0) {
      await log('🚨 Lockdown re-broadcast')

      let i = 0
      while (i < lockdownTimes) {
        await enqueue(lockdownEntrySound, lockdownRepeatRingerWire)
        i++
      }
    }

    return
  }

  const schedule = await prisma.schedule.findFirst({
    where: {time: currentTime, day: currentDay}
  })

  if (schedule && schedule.weekDays.split(',').includes(dayNumber)) {
    const sequence = JSON.parse(schedule.sequence) as string[]

    let i = 0
    while (i < sequence.length) {
      await enqueue(sequence[i])
      i++
    }

    await processQueue()
  }
}
