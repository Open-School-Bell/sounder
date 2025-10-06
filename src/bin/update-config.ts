import fs from 'fs'
import path from 'path'
import {finished} from 'stream/promises'
import {Readable} from 'stream'
import {asyncForEach} from '@arcath/utils'
import {mkdirp} from 'mkdirp'

import {log} from '../utils/log'
import {sounderApi} from '../utils/sounder-api'
import {getSetting, setSetting, setSettings, getPrisma} from '../utils/prisma'

export const updateConfig = async (logToConsole: boolean = true) => {
  const prisma = getPrisma()

  const controllerAddress = await getSetting('controllerAddress')

  await sounderApi('/ping', {})

  const response = await sounderApi('/get-config', {})

  if (!response) return

  const result = (await response.json()) as {
    id: string
    name: string
    day: string
    ringerPin: number
    screen: boolean
    lockdown: {
      enable: boolean
      entrySound: string
      exitSound: string
      times: number
      exitTimes: number
      interval: number
      repeatRingerWire: boolean
    }
  }

  await setSettings({
    sounderId: result.id,
    sounderName: result.name,
    screenEnabled: result.screen,
    sounderPin: result.ringerPin,
    currentDay: result.day,
    lockdownEnable: result.lockdown.enable,
    lockdownEntrySound: result.lockdown.entrySound,
    lockdownExitSound: result.lockdown.exitSound,
    lockdownTimes: result.lockdown.times,
    lockdownExitTimes: result.lockdown.exitTimes,
    lockdownInterval: result.lockdown.interval,
    lockdownRepeatRingerWire: result.lockdown.repeatRingerWire
  })

  await log(`✅ Config updated!`, logToConsole)

  const soundsResponse = await sounderApi('/get-sounds', {})

  if (!soundsResponse) return

  const sounds = (await soundsResponse.json()) as {
    id: string
    fileName: string
    ringerWire: string
    name: string
  }[]

  await mkdirp(path.join(process.cwd(), 'sounds'))

  await asyncForEach(sounds, async ({id, fileName, ringerWire, name}) => {
    const downloadResponse = await fetch(
      `${controllerAddress}/sounds/${fileName}`
    ).catch(() => log(`⚠️ Unable to download sound ${fileName}`, logToConsole))

    if (!downloadResponse) return

    const downloadStream = fs.createWriteStream(
      path.join(process.cwd(), 'sounds', fileName)
    )
    await finished(
      Readable.fromWeb(downloadResponse.body as any).pipe(downloadStream)
    )

    await prisma.sound.upsert({
      where: {id},
      create: {id, fileName, ringerWire, name},
      update: {fileName, ringerWire, name}
    })
  })

  await log(`🔊 Sounds Downloaded`, logToConsole)
}

export const updateController = async (newController: string) => {
  await setSetting('controllerAddress', newController)

  await log(`✅ Controller updated!`)
}
