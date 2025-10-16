import cron from 'node-cron'
import express from 'express'
import fs from 'fs'
import path from 'path'

import {updateConfig} from './bin/update-config'
import {log} from './utils/log'
import {sounderApi} from './utils/sounder-api'
import {VERSION} from './constants'
import {enqueue, enqueueMany, processQueue} from './utils/play-queue'

import {minutely} from './events/minutely'
import {getSetting, getSettings} from './utils/prisma'

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

  const sounderKey = await getSetting('sounderKey', '')
  if (sounderKey === '') {
    console.log('❌ Please Enroll before starting')
    process.exit()
  }
  await updateConfig()

  const app = express()

  app.use(express.json())

  app.get('/', (request, response) => {
    response.json({status: 'OK'})
  })

  app.get('/status', async (request, response) => {
    const {sounderName, lockdownEnable} = await getSettings([
      'sounderName',
      'lockdownEnable'
    ])

    response.json({
      name: sounderName,
      lockdown: lockdownEnable,
      version: VERSION
    })
  })

  app.post('/update', async (request, response) => {
    if (request.body.key !== sounderKey) {
      await log('🔑 Bad key from controller')
      response.json({error: 'bad key'})
      return
    }

    await updateConfig()

    response.json({status: 'OK'})
  })

  app.post('/play', async (request, response) => {
    if (request.body.key !== sounderKey) {
      await log('🔑 Bad key from controller')
      response.json({error: 'bad key'})
      return
    }

    await enqueueMany(JSON.parse(request.body.sounds))

    void processQueue()

    response.json({status: 'OK'})
  })

  app.post('/lockdown', async (request, response) => {
    await updateConfig()

    const {
      lockdownEnable,
      lockdownEntrySound,
      lockdownExitSound,
      lockdownTimes,
      lockdownExitTimes
    } = await getSettings([
      'lockdownEnable',
      'lockdownEntrySound',
      'lockdownExitSound',
      'lockdownTimes',
      'lockdownExitTimes',
      'sounderPin'
    ])

    if (request.body.key !== sounderKey) {
      await log('🔑 Bad key from controller')
      response.json({error: 'bad key'})
      return
    }

    await log(`🚨 Lockdown ${lockdownEnable ? 'start' : 'end'}`)

    if (lockdownEnable) {
      let i = 0
      while (i < lockdownTimes) {
        await enqueue(lockdownEntrySound)
        i++
      }
    } else {
      let i = 0
      while (i < lockdownExitTimes) {
        await enqueue(lockdownExitSound)
        i++
      }
    }

    void processQueue()

    response.json({status: 'OK'})
  })

  const screenEnabled = await getSetting('screenEnabled')

  if (screenEnabled) {
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

      const config = await getSettings(['sounderName'])

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
