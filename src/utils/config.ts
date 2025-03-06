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
}

export const getConfig = async (): Promise<Config> => {
  const content = await readFile(path.join(process.cwd(), 'sounder.json'))

  const config = JSON.parse(content.toString())

  return config
}
