import {PrismaClient, type Sound} from '../../generated/prisma/client'

declare global {
  // This prevents us from making multiple connections to the db when the
  // require cache is cleared.
  var __prisma: PrismaClient | undefined
}

const prisma = global.__prisma ?? (global.__prisma = new PrismaClient())

export const getPrisma = () => prisma

export type ConfigKey = keyof ConfigType

type ConfigType = {
  /** The ID of the sounder on the controller. */
  sounderId: string
  sounderKey: string
  sounderName: string
  sounderPin: number
  screenEnabled: boolean
  controllerAddress: string
  currentDay: string
  lockdownEnable: boolean
  lockdownEntrySound: string
  lockdownExitSound: string
  lockdownTimes: number
  lockdownExitTimes: number
  lockdownInterval: number
  lockdownRepeatRingerWire: boolean
}

/**
 * Retrive the named setting from the database.
 *
 * @param key the setting key to return
 * @returns The value stored at the given setting key.
 */
export const getSetting = async <Key extends ConfigKey>(
  key: Key,
  fallback?: ConfigType[Key]
): Promise<ConfigType[Key]> => {
  const setting = await prisma.config.findFirst({where: {key}})

  if (!setting) {
    if (fallback) {
      return fallback
    }

    throw `Setting ${key} not found`
  }

  return JSON.parse(setting.value)
}

/**
 * Retrive the named settings from the database.
 *
 * @param keys An array of keys to select from the database
 * @returns An object indexed by the keys requested containing their values.
 */
export const getSettings = async <Keys extends ConfigKey>(keys: Keys[]) => {
  const data = Object.fromEntries(keys.map(v => [v, ''])) as {
    [key in Keys]: ConfigType[key]
  }

  const config = (await prisma.config.findMany({
    where: {key: {in: keys}}
  })) as any as Array<{key: Keys; value: string}>

  config.forEach(({key, value}) => {
    data[key] = JSON.parse(value)
  })

  return data
}

/**
 * Set the given key to the supplied value.
 *
 * @param key The key to set.
 * @param value The value to set the key to.
 * @returns
 */
export const setSetting = async <Key extends ConfigKey>(
  key: Key,
  value: ConfigType[Key]
) => {
  await prisma.config.upsert({
    where: {key},
    update: {value: JSON.stringify(value)},
    create: {key, value: JSON.stringify(value)}
  })

  return
}

/**
 * Takes an object indexed by setting keys and sets all those settings
 *
 * @param settings object containing the setting key/values to update
 * @returns Promise<void>
 */
export const setSettings = async <Keys extends ConfigKey>(settings: {
  [key in Keys]: ConfigType[key]
}) => {
  const keys = Object.keys(settings) as Keys[]

  const promises = keys.map(key => {
    return new Promise<void>(async resolve => {
      await setSetting(key, settings[key])
      resolve()
    })
  })

  await Promise.all(promises)

  return
}

export const getSounds = async (soundIds: string[]) => {
  const prisma = getPrisma()

  const sounds = await prisma.sound.findMany({where: {id: {in: soundIds}}})

  return soundIds.map(soundId => {
    return sounds.find(({id}) => {
      return id === soundId
    })
  }) as Sound[]
}
