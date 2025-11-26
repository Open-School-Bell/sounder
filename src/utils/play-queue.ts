import {getPrisma, getSetting} from './prisma'
import {playSound} from './play'
import {ring} from './ring'
import {log} from './log'

export const enqueue = async (soundId: string, ringerWire: boolean = true) => {
  const prisma = getPrisma()

  return prisma.soundQueue.create({data: {soundId, ringerWire}})
}

export const enqueueMany = async (soundIds: string[]) => {
  const prisma = getPrisma()

  return prisma.soundQueue.createMany({
    data: soundIds.map(soundId => {
      return {soundId}
    })
  })
}

export const processQueue = async (): Promise<void> => {
  const prisma = getPrisma()

  const sounderPin = await getSetting('sounderPin')

  const queueLength = await prisma.soundQueue.count()

  await log(`🗃️ Processing Queue. ${queueLength} in queue.`)

  const firstSound = await prisma.soundQueue.findFirst({
    orderBy: {order: 'asc'},
    include: {sound: true}
  })

  if (!firstSound) {
    return
  }

  await Promise.all([
    new Promise<void>(async resolve => {
      await playSound(firstSound.sound.fileName)
      resolve()
    }),
    new Promise<void>(async resolve => {
      if (
        sounderPin !== 0 &&
        firstSound.sound.ringerWire !== '' &&
        firstSound.ringerWire
      ) {
        await ring(firstSound.sound.ringerWire, sounderPin)
      }
      resolve()
    })
  ])

  await prisma.soundQueue.delete({where: {id: firstSound.id}})

  return processQueue()
}
