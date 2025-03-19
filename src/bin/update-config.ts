import fs from 'fs'
import path from 'path'
import {finished} from 'stream/promises'
import {Readable} from 'stream'
import {asyncForEach} from '@arcath/utils'
import {mkdirp} from 'mkdirp'

import {getConfig} from '../utils/config'
import {log} from '../utils/log'
import {sounderApi} from '../utils/sounder-api'

const {writeFile} = fs.promises

export const updateConfig = async () => {
  const {key, controller} = await getConfig()

  await sounderApi('/ping', {})

  const response = await sounderApi('/get-config', {})

  if (!response) return

  const result = await response.json()

  const content = JSON.stringify({...result, controller, key}, null, ' ')

  await writeFile(path.join(process.cwd(), 'sounder.json'), content)
  await log(`✅ Config updated!`)

  const soundsResponse = await sounderApi('/get-audio', {})

  if (!soundsResponse) return

  const sounds = (await soundsResponse.json()) as {
    id: string
    fileName: string
  }[]

  await mkdirp(path.join(process.cwd(), 'sounds'))

  await asyncForEach(sounds, async ({fileName}) => {
    const downloadResponse = await fetch(
      `${controller}/sounds/${fileName}`
    ).catch(() => log(`⚠️ Unable to download sound ${fileName}`))

    if (!downloadResponse) return

    const downloadStream = fs.createWriteStream(
      path.join(process.cwd(), 'sounds', fileName)
    )
    await finished(
      Readable.fromWeb(downloadResponse.body as any).pipe(downloadStream)
    )
  })

  await log(`🔊 Sounds Downloaded`)
}

export const updateController = async (newController: string) => {
  const config = await getConfig()

  config.controller = newController

  await writeFile(
    path.join(process.cwd(), 'sounder.json'),
    JSON.stringify(config)
  )
  await log(`✅ Controller updated!`)
}
