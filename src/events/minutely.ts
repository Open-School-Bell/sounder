import {sounderApi} from '../utils/sounder-api'
import {log} from '../utils/log'
import {VERSION} from '../constants'
import {getPrisma, getSettings} from '../utils/prisma'
import {enqueue, processQueue, enqueueMany} from '../utils/play-queue'

export const minutely = async () => {
  const date = new Date()
  const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  const dayNumber = `${date.getDay() === 0 ? 7 : date.getDay()}`

  const prisma = getPrisma()

  const {
    currentDay,
    lockdownEnable,
    lockdownInterval,
    lockdownEntrySequence,
    lockdownRepeatRingerWire
  } = await getSettings([
    'currentDay',
    'lockdownEnable',
    'lockdownInterval',
    'lockdownEntrySequence',
    'lockdownRepeatRingerWire',
    'sounderPin'
  ])

  await sounderApi('/ping', {version: VERSION})

  if (lockdownEnable && lockdownInterval !== 0) {
    if (date.getMinutes() % lockdownInterval === 0) {
      await log('🚨 Lockdown re-broadcast')

      await enqueueMany(
        JSON.parse(lockdownEntrySequence),
        lockdownRepeatRingerWire
      )

      await processQueue()
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
