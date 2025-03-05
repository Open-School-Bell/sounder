import fs from 'fs'
import path from 'path'
import {finished} from 'stream/promises'
import {Readable} from 'stream'
import {asyncForEach} from '@arcath/utils'
import {mkdirp} from 'mkdirp'

import {getConfig} from '../utils/config'
import {log} from '../utils/log'

const {writeFile} = fs.promises

export const updateConfig = async () => {
  const {key, controller} = await getConfig()

  await fetch(`http://${controller}:5173/sounder-api/ping`, {
    method: 'post',
    body: JSON.stringify({
      key
    })
  }).catch(reason => {
    log(`⚠️ Unable to ping`)
  })

  const response = await fetch(
    `http://${controller}:5173/sounder-api/get-config`,
    {
      method: 'post',
      body: JSON.stringify({
        key
      })
    }
  ).catch(() => log(`⚠️ Unable to get config`))

  if (!response) return

  const result = await response.json()

  const content = JSON.stringify({...result, controller, key}, null, ' ')

  await writeFile(path.join(process.cwd(), 'sounder.json'), content)
  log(`✅ Config updated!`)

  const soundsResponse = await fetch(
    `http://${controller}:5173/sounder-api/get-audio`,
    {
      method: 'post',
      body: JSON.stringify({
        key
      })
    }
  ).catch(() => log(`⚠️ Unable to get sounds`))

  if (!soundsResponse) return

  const sounds = (await soundsResponse.json()) as {
    id: string
    fileName: string
  }[]

  await mkdirp(path.join(process.cwd(), 'sounds'))

  await asyncForEach(sounds, async ({id, fileName}) => {
    const downloadResponse = await fetch(
      `http://${controller}:5173/sounds/${fileName}`
    ).catch(() => log(`⚠️ Unable to download sound ${fileName}`))

    if (!downloadResponse) return

    const downloadStream = fs.createWriteStream(
      path.join(process.cwd(), 'sounds', `${id}.mp3`)
    )
    await finished(
      Readable.fromWeb(downloadResponse.body as any).pipe(downloadStream)
    )
  })

  log(`🔊 Sounds Downloaded`)
}
