import cron from 'node-cron'
import express from 'express'

import {updateConfig} from './bin/update-config'
import {getConfig} from './utils/config'
import {playSound} from './utils/play'

export const sounder = async () => {
  cron.schedule('* * * * *', async () => {
    const date = new Date()
    const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    const dayNumber = `${date.getDay() === 0 ? 7 : date.getDay()}`

    console.log(date.toISOString())
    console.log([currentTime, dayNumber])
    const config = await getConfig()

    await fetch(`http://${config.controller}:5173/sounder-api/ping`, {
      method: 'post',
      body: JSON.stringify({
        key: config.key
      })
    })

    const fileName = config.schedules.reduce(
      (fileName, schedule) => {
        if (fileName) return fileName

        const [time, file, dayType, days] = schedule.split('/')

        if (time !== currentTime) return false
        if (!days.split(',').includes(dayNumber)) return false

        return file
      },
      false as false | string
    )

    if (fileName) {
      console.log(`🔔 Ring Ring "${fileName}"`)
      playSound(fileName)
    }
  })

  cron.schedule('0 * * * *', () => {
    updateConfig()
  })

  console.log(`🚀 Launching Sounder`)
  const config = await getConfig()
  if (!config.key) {
    console.log('❌ Please Enroll before starting')
  }
  updateConfig()

  const app = express()

  app.get('/', (request, response) => {
    response.json({status: 'OK'})
  })

  app.get('/update', (request, response) => {
    updateConfig()

    response.json({status: 'OK'})
  })

  app.get('/play', (request, response) => {
    playSound(request.query.id as string)

    response.json({status: 'OK'})
  })

  app.listen(3000)
}
