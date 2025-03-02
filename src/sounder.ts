import cron from 'node-cron'

import { updateConfig } from './bin/update-config'
import { getConfig } from './utils/config'
import { playSound } from './utils/play'

export const sounder = async () => {
  cron.schedule('* * * * *', async () => {
    const date = new Date()
    const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

    console.log(date.toISOString())
    console.log(currentTime)
    const config = await getConfig()

    const fileName = config.schedules.reduce((fileName, schedule) => {
      if(fileName) return fileName

      const [time, file] = schedule.split('/')

      if(time === currentTime) return file

      return false
    }, false as false | string)

    if(fileName){
      console.log(`🔔 Ring Ring "${fileName}"`)
      playSound(fileName)
    }
  })

  cron.schedule('0 * * * *', () => {
    updateConfig()
  })
  
  console.log(`🚀 Launching Sounder`)
  const config = await getConfig()
  if(!config.key){
    console.log('❌ Please Enroll before starting')
  }
  updateConfig()
}