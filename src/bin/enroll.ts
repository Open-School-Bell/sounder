import {title, step} from '../utils/cli'
import {setSetting} from '../utils/prisma'

export const enroll = async (key: string, controller: string) => {
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

  done()
  process.exit(0)
}
