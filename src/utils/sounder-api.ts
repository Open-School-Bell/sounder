import {getSettings} from './prisma'

export const sounderApi = async (path: string, payload: object) => {
  const {sounderKey, controllerAddress} = await getSettings([
    'sounderKey',
    'controllerAddress'
  ])

  const response = await fetch(`${controllerAddress}/sounder-api${path}`, {
    method: 'post',
    body: JSON.stringify({
      key: sounderKey,
      ...payload
    })
  }).catch(() => {
    console.log(`⚠️ Unable to contact controller`)
  })

  return response
}
