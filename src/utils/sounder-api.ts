import {getConfig} from './config'

export const sounderApi = async (path: string, payload: object) => {
  const {key, controller} = await getConfig()

  const response = await fetch(`${controller}/sounder-api${path}`, {
    method: 'post',
    body: JSON.stringify({
      key,
      ...payload
    })
  }).catch(() => {
    console.log(`⚠️ Unable to contact controller`)
  })

  return response
}
