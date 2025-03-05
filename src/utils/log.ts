import {sounderApi} from './sounder-api'

export const log = async (message: string) => {
  console.log(message)
  await sounderApi('/log', {message})
}
