import cron from 'node-cron'
import express from 'express'
import fs from 'fs'
import path from 'path'

import {updateConfig} from './bin/update-config'
import {getConfig} from './utils/config'
import {playSound} from './utils/play'
import {log} from './utils/log'
import {sounderApi} from './utils/sounder-api'
import {ring} from './utils/ring'

const {writeFile} = fs.promises

export const sounder = async () => {
  cron.schedule('* * * * *', async () => {
    const date = new Date()
    const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    const dayNumber = `${date.getDay() === 0 ? 7 : date.getDay()}`

    const config = await getConfig()

    await sounderApi('/ping', {})

    const [fileName, ringerWire] = config.schedules.reduce(
      ([fileName, ringerWire], schedule) => {
        if (fileName) return [fileName, ringerWire]

        const [time, file, dayType, days, ringer] = schedule.split('/')

        if (time !== currentTime) return [false, false] as [false, false]
        if (!days.split(',').includes(dayNumber))
          return [false, false] as [false, false]
        if (dayType !== config.day) return [false, false] as [false, false]

        return [file, ringer]
      },
      [false, false] as [false | string, false | string]
    )

    if (fileName) {
      log(`🔔 Ring Ring "${fileName}"`)
      playSound(fileName)
      if (ringerWire && ringerWire !== '') {
        ring(ringerWire, config.ringerPin)
      }
    }
  })

  cron.schedule('0 * * * *', () => {
    updateConfig()
  })

  log(`🚀 Launching Sounder`)
  await writeFile(
    path.join(process.cwd(), 'sounder.pid'),
    process.pid.toString()
  )
  const config = await getConfig()
  if (!config.key) {
    console.log('❌ Please Enroll before starting')
  }
  updateConfig()

  const app = express()

  app.use(express.json())

  app.all('/')

  app.get('/', (request, response) => {
    response.json({status: 'OK'})
  })

  app.get('/update', (request, response) => {
    updateConfig()

    response.json({status: 'OK'})
  })

  app.post('/play', (request, response) => {
    if (request.body.key !== config.key) {
      log('🔑 Bad key from controller')
      response.json({error: 'bad key'})
      return
    }

    playSound(request.body.sound as string)
    if (request.body.ringerWire !== '' && config.ringerPin !== 0) {
      ring(request.body.ringerWire, config.ringerPin)
    }

    log(`📢 Broadcast ${request.body.sound as string}`)

    response.json({status: 'OK'})
  })

  app.listen(3000)
}
