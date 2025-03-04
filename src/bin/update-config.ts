import fs from 'fs'
import path from 'path'
import {finished} from 'stream/promises'
import {Readable} from 'stream'
import {asyncForEach} from '@arcath/utils'
import {mkdirp} from 'mkdirp'

import {getConfig} from '../utils/config'

const {writeFile} = fs.promises

export const updateConfig = async () => {
  const {key, controller} = await getConfig()

  await fetch(`http://${controller}:5173/sounder-api/ping`, {
    method: 'post',
    body: JSON.stringify({
      key
    })
  })

  const response = await fetch(
    `http://${controller}:5173/sounder-api/get-config`,
    {
      method: 'post',
      body: JSON.stringify({
        key
      })
    }
  )

  const result = await response.json()

  const content = JSON.stringify({...result, controller, key})

  await writeFile(path.join(process.cwd(), 'sounder.json'), content)
  console.log(`✅ Config updated!`)

  const soundsResponse = await fetch(
    `http://${controller}:5173/sounder-api/get-audio`,
    {
      method: 'post',
      body: JSON.stringify({
        key
      })
    }
  )

  const sounds = (await soundsResponse.json()) as {
    id: string
    fileName: string
  }[]

  await mkdirp(path.join(process.cwd(), 'sounds'))

  await asyncForEach(sounds, async ({id, fileName}) => {
    const downloadResponse = await fetch(
      `http://${controller}:5173/sounds/${fileName}`
    )
    const downloadStream = fs.createWriteStream(
      path.join(process.cwd(), 'sounds', `${id}.mp3`)
    )
    await finished(
      Readable.fromWeb(downloadResponse.body as any).pipe(downloadStream)
    )
  })

  console.log(`🔊 Sounds Downloaded`)
}
