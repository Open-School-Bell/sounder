import fs from 'fs'
import path from 'path'

const {readFile} = fs.promises

export type Config = {
  key: string
  controller: string
  name: string
  id: string
  day: string
  schedules: string[]
  ringerPin: number
  screen: boolean
  lockdown: {
    enable: boolean
    entrySound: string
    entrySoundRingerWire: string
    exitSound: string
    exitSoundRingerWire: string
    times: number
    interval: number
    repeatRingerWire: boolean
  }
}

export const getConfig = async (): Promise<Config> => {
  const content = await readFile(path.join(process.cwd(), 'sounder.json'))

  const config = JSON.parse(content.toString())

  return config
}
