import {getConfig} from './config'

export const log = async (message: string) => {
  const config = await getConfig()

  console.log(message)

  await fetch(`http://${config.controller}:5173/sounder-api/log`, {
    method: 'post',
    body: JSON.stringify({
      key: config.key,
      message
    })
  }).catch(() => console.log('⛓️‍💥 Could not send log'))
}
