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

    if (config.lockdown.enable) {
      if (date.getMinutes() % config.lockdown.interval === 0) {
        playSound(config.lockdown.entrySound)
        if (
          config.lockdown.repeatRingerWire &&
          config.lockdown.entrySoundRingerWire !== '' &&
          config.ringerPin !== 0
        ) {
          ring(config.lockdown.entrySoundRingerWire, config.ringerPin)
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
      log(`🔔 Ring Ring "${fileName}"`)
      playSound(fileName, parseInt(count ? count : '1'))
      if (ringerWire && ringerWire !== '') {
        ring(ringerWire, config.ringerPin, parseInt(count ? count : '1'))
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

    playSound(request.body.sound as string, request.body.times)
    if (request.body.ringerWire !== '' && config.ringerPin !== 0) {
      ring(request.body.ringerWire, config.ringerPin, request.body.times)
    }

    log(`📢 Broadcast ${request.body.sound as string}`)

    response.json({status: 'OK'})
  })

  app.post('/lockdown', async (request, response) => {
    const config = await getConfig()

    if (request.body.key !== config.key) {
      log('🔑 Bad key from controller')
      response.json({error: 'bad key'})
      return
    }

    log(`🚨 Lockdown ${config.lockdown.enable ? 'start' : 'end'}`)

    if (config.lockdown.enable) {
      playSound(config.lockdown.entrySound)
      if (
        config.ringerPin !== 0 &&
        config.lockdown.entrySoundRingerWire !== ''
      ) {
        ring(config.lockdown.entrySoundRingerWire, config.ringerPin)
      }
    } else {
      playSound(config.lockdown.exitSound)
      if (
        config.ringerPin !== 0 &&
        config.lockdown.exitSoundRingerWire !== ''
      ) {
        ring(config.lockdown.exitSoundRingerWire, config.ringerPin)
      }
    }
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
