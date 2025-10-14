import {sounderApi} from '../utils/sounder-api'
import {playSound} from '../utils/play'
import {ring} from '../utils/ring'
import {log} from '../utils/log'
import {VERSION} from '../constants'
import {getPrisma, getSettings, getSounds} from '../utils/prisma'
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
    lockdownRepeatRingerWire,
    sounderPin
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

      const sound = (await getSounds([lockdownEntrySound]))[0]

      void playSound(sound.fileName, lockdownTimes)
      if (
        lockdownRepeatRingerWire &&
        sound.ringerWire !== '' &&
        sounderPin !== 0
      ) {
        void ring(sound.ringerWire, sounderPin, lockdownTimes)
      }
    }

    return
  }

  const schedule = await prisma.schedule.findFirst({
    where: {time: currentTime, day: currentDay}
  })

  if (schedule && schedule.weekDays.split(',').includes(dayNumber)) {
    let i = 0
    while (i < schedule.count) {
      await enqueue(schedule.soundId)
      i++
    }

    await processQueue()
  }
}
