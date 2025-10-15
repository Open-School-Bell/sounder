import {sounderApi} from './sounder-api'

export const log = async (message: string, outputToConsole: boolean = true) => {
  if (outputToConsole) {
    console.log(message)
  }
  await sounderApi('/log', {message})
}
