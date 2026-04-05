import {getSetting, setSetting, type ConfigKey} from '../utils/prisma'

export const configKey = async (key: ConfigKey) => {
  const value = await getSetting(key)

  console.log(value)
}

export const setConfigKey = async (key: ConfigKey, value: string) => {
  await setSetting(key, value)

  console.log(value)
}
