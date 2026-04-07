import {title, step} from '../utils/cli'
import {getSetting, setSetting} from '../utils/prisma'

export const enroll = async (
  key: string,
  controller: string,
  exitOnFinish: boolean = true
) => {
  title('Sounder Enrollment')

  const done = step('Enrolling')
  const response = await fetch(`${controller}/sounder-api/enroll`, {
    method: 'post',
    body: JSON.stringify({
      key
    })
  })

  const result = await response.json()

  await setSetting('controllerAddress', controller)
  await setSetting('sounderId', result.id)
  await setSetting('sounderKey', key)
  await setSetting('sounderName', result.name)

  await getSetting('sounderKey')

  done()
  if (exitOnFinish) {
    process.exit(0)
  }
}

export const enrollWithConfig = async (exitOnFinish: boolean = true) => {
  const key = await getSetting('sounderKey')
  const controller = await getSetting('controllerAddress')

  await enroll(key, controller, exitOnFinish)
}
