import {getConfig} from '../utils/config'
import {sounderApi} from '../utils/sounder-api'
import {playSound} from '../utils/play'
import {ring} from '../utils/ring'
import {log} from '../utils/log'

export const minutely = async () => {
  const date = new Date()
  const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  const dayNumber = `${date.getDay() === 0 ? 7 : date.getDay()}`

  const config = await getConfig()

  await sounderApi('/ping', {})

  if (config.lockdown.enable) {
    if (date.getMinutes() % config.lockdown.interval === 0) {
      void playSound(config.lockdown.entrySound)
      if (
        config.lockdown.repeatRingerWire &&
        config.lockdown.entrySoundRingerWire !== '' &&
        config.ringerPin !== 0
      ) {
        void ring(config.lockdown.entrySoundRingerWire, config.ringerPin)
      }
    }
  }

  const [fileName, ringerWire, count] = config.schedules.reduce(
    ([fileName, ringerWire, count], schedule) => {
      if (fileName) return [fileName, ringerWire, count]

      const [time, file, dayType, days, ringer, c] = schedule.split('/')

      if (time !== currentTime)
        return [false, false, false] as [false, false, false]
      if (!days.split(',').includes(dayNumber))
        return [false, false, false] as [false, false, false]
      if (dayType !== config.day)
        return [false, false, false] as [false, false, false]

      return [file, ringer, c]
    },
    [false, false, false] as [false | string, false | string, false | string]
  )

  if (fileName) {
    await log(`🔔 Ring Ring "${fileName}"`)
    void playSound(fileName, parseInt(count ? count : '1'))
    if (ringerWire && ringerWire !== '') {
      void ring(ringerWire, config.ringerPin, parseInt(count ? count : '1'))
    }
  }
}
