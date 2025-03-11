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

  if (config.screen) {
    console.log('📺 Launching Screen at http://127.0.0.1:3000')

    app.use(express.static(path.join(process.cwd(), 'screen')))
    app.get('/screen/config', async (request, response) => {
      const config = await getConfig()

      response.json(config)
    })

    app.get('/screen/zones', async (request, response) => {
      const apiResponse = await sounderApi('/get-zones', {})

      if (!apiResponse) {
        response.json({zones: []})
        return
      }

      const {zones} = await apiResponse.json()

      response.json({zones})
    })

    app.get('/screen/day', async (request, response) => {
      const apiResponse = await sounderApi('/get-day', {})

      if (!apiResponse) {
        response.json({zones: []})
        return
      }

      const {schedules, dayType} = await apiResponse.json()

      response.json({schedules, dayType})
    })

    app.get('/screen/actions', async (request, response) => {
      const apiResponse = await sounderApi('/get-actions', {})

      if (!apiResponse) {
        response.json({actions: []})
        return
      }

      const {actions} = await apiResponse.json()

      response.json({actions})
    })

    app.post('/screen/trigger-action', async (request, response) => {
      const {action, zone} = request.body

      await log(`📤 Trigger action ${action} with zone ${zone}`)
      await sounderApi('/trigger-action', {action, zone})

      response.json({status: 'ok'})
    })
  }

  app.listen(3000)
}
