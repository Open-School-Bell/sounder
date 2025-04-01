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
import {VERSION} from './constants'

import {minutely} from './events/minutely'

const {writeFile} = fs.promises

export const sounder = async () => {
  cron.schedule('* * * * *', async () => {
    await minutely()
  })

  cron.schedule('0 * * * *', async () => {
    await updateConfig()
  })

  await log(`🚀 Launching Sounder`)
  await writeFile(
    path.join(process.cwd(), 'sounder.pid'),
    process.pid.toString()
  )
  const config = await getConfig()
  if (!config.key) {
    console.log('❌ Please Enroll before starting')
    process.exit()
  }
  await updateConfig()

  const app = express()

  app.use(express.json())

  app.all('/')

  app.get('/', (request, response) => {
    response.json({status: 'OK'})
  })

  app.get('/status', async (request, response) => {
    const config = await getConfig()

    response.json({
      name: config.name,
      lockdown: config.lockdown.enable,
      version: VERSION
    })
  })

  app.post('/update', async (request, response) => {
    if (request.body.key !== config.key) {
      await log('🔑 Bad key from controller')
      response.json({error: 'bad key'})
      return
    }

    await updateConfig()

    response.json({status: 'OK'})
  })

  app.post('/play', async (request, response) => {
    if (request.body.key !== config.key) {
      await log('🔑 Bad key from controller')
      response.json({error: 'bad key'})
      return
    }

    void playSound(request.body.sound as string, request.body.times)
    if (request.body.ringerWire !== '' && config.ringerPin !== 0) {
      void ring(request.body.ringerWire, config.ringerPin, request.body.times)
    }

    await log(`📢 Broadcast ${request.body.sound as string}`)

    response.json({status: 'OK'})
  })

  app.post('/lockdown', async (request, response) => {
    await updateConfig()

    const config = await getConfig()

    if (request.body.key !== config.key) {
      await log('🔑 Bad key from controller')
      response.json({error: 'bad key'})
      return
    }

    await log(`🚨 Lockdown ${config.lockdown.enable ? 'start' : 'end'}`)

    if (config.lockdown.enable) {
      void playSound(config.lockdown.entrySound, config.lockdown.times)
      if (
        config.ringerPin !== 0 &&
        config.lockdown.entrySoundRingerWire !== ''
      ) {
        void ring(
          config.lockdown.entrySoundRingerWire,
          config.ringerPin,
          config.lockdown.times
        )
      }
    } else {
      void playSound(config.lockdown.exitSound)
      if (
        config.ringerPin !== 0 &&
        config.lockdown.exitSoundRingerWire !== ''
      ) {
        void ring(
          config.lockdown.exitSoundRingerWire,
          config.ringerPin,
          config.lockdown.times
        )
      }
    }

    response.json({status: 'OK'})
  })

  if (config.screen) {
    console.log('📺 Launching Screen at http://127.0.0.1:3000')

    const allowedIps = ['::1', '127.0.0.1']

    app.use(express.static(path.join(process.cwd(), 'screen')))
    app.get('/screen/config', async (request, response) => {
      if (
        !request.socket.remoteAddress ||
        !allowedIps.includes(request.socket.remoteAddress)
      ) {
        response.json({error: 403})
      }

      const config = await getConfig()

      response.json(config)
    })

    app.get('/screen/zones', async (request, response) => {
      if (
        !request.socket.remoteAddress ||
        !allowedIps.includes(request.socket.remoteAddress)
      ) {
        response.json({error: 403})
      }

      const apiResponse = await sounderApi('/get-zones', {})

      if (!apiResponse) {
        response.json({zones: []})
        return
      }

      const {zones} = await apiResponse.json()

      response.json({zones})
    })

    app.get('/screen/day', async (request, response) => {
      if (
        !request.socket.remoteAddress ||
        !allowedIps.includes(request.socket.remoteAddress)
      ) {
        response.json({error: 403})
      }

      const apiResponse = await sounderApi('/get-day', {})

      if (!apiResponse) {
        response.json({zones: []})
        return
      }

      const {schedules, dayType} = await apiResponse.json()

      response.json({schedules, dayType})
    })

    app.get('/screen/actions', async (request, response) => {
      if (
        !request.socket.remoteAddress ||
        !allowedIps.includes(request.socket.remoteAddress)
      ) {
        response.json({error: 403})
      }

      const apiResponse = await sounderApi('/get-actions', {})

      if (!apiResponse) {
        response.json({actions: []})
        return
      }

      const {actions} = await apiResponse.json()

      response.json({actions})
    })

    app.get('/screen/status', async (request, response) => {
      if (
        !request.socket.remoteAddress ||
        !allowedIps.includes(request.socket.remoteAddress)
      ) {
        response.json({error: 403})
      }

      const apiResponse = await sounderApi('/get-status', {})

      if (!apiResponse) {
        response.json({system: 'down', lockdown: false, sounders: []})
        return
      }

      const {system, lockdown, sounders} = await apiResponse.json()

      response.json({system, lockdown, sounders})
    })

    app.post('/screen/trigger-action', async (request, response) => {
      if (
        !request.socket.remoteAddress ||
        !allowedIps.includes(request.socket.remoteAddress)
      ) {
        response.json({error: 403})
      }

      const {action, zone} = request.body

      await log(`📤 Trigger action ${action} with zone ${zone}`)
      await sounderApi('/trigger-action', {action, zone})

      response.json({status: 'ok'})
    })
  }

  app.listen(3000)
}
