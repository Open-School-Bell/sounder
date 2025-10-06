import {getConfig} from '../utils/config'
import {updateConfig} from './update-config'
import {title, step} from '../utils/cli'
import {setSetting} from '../utils/prisma'
import {log} from '../utils/log'

export const upgrade2x = async () => {
  title('2x Upgrade')
  console.log('')

  const doneLoadConfig = step('Loading Config')
  const config = await getConfig()
  doneLoadConfig()

  const doneSaveToDB = step('Saving basic config to database')

  await setSetting('controllerAddress', config.controller)
  await setSetting('sounderId', config.id)
  await setSetting('sounderKey', config.key)
  await log('2x upgrade begun', false)

  doneSaveToDB()

  const doneUpdateConfig = step('Update config from controller')

  await updateConfig(false)

  doneUpdateConfig()
}
