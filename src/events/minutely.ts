import {sounderApi} from '../utils/sounder-api'
import {playSound} from '../utils/play'
import {ring} from '../utils/ring'
import {log} from '../utils/log'
import {VERSION} from '../constants'
import {getPrisma, getSettings, getSounds} from '../utils/prisma'

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
    const scheduleSound = (await getSounds([schedule.soundId]))[0]

    await log(`🔔 Ring Ring "${scheduleSound.name}"`)
    void playSound(scheduleSound.fileName, schedule.count)
    if (sounderPin !== 0 && scheduleSound.ringerWire !== '') {
      void ring(scheduleSound.ringerWire, sounderPin, schedule.count)
    }
  }
}
