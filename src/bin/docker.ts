import {getSettings, setSetting} from '../utils/prisma'
import {updateConfig} from './update-config'
import {sounder} from '../sounder'
import {enrollWithConfig} from './enroll'

export const docker = async () => {
  const {controllerAddress, sounderKey} = await getSettings([
    'controllerAddress',
    'sounderKey'
  ])

  if (
    process.env.CONTROLLER_URL &&
    controllerAddress !== process.env.CONTROLLER_URL
  ) {
    console.log('Setting Controller Address to environment variable')
    await setSetting('controllerAddress', process.env.CONTROLLER_URL)
  }

  if (process.env.ENROLLMENT_KEY && sounderKey !== process.env.ENROLLMENT_KEY) {
    console.log('Setting Sounder Key to environment variable')
    await setSetting('sounderKey', process.env.ENROLLMENT_KEY)
  }

  await enrollWithConfig()

  await updateConfig()

  void sounder()
}
