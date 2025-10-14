import {describe, it, expect, beforeEach} from 'vitest'
import {faker} from '@faker-js/faker'

import {enqueue, enqueueMany, processQueue} from '../../src/utils/play-queue'
import {getPrisma} from '../../src/utils/prisma'

describe('Play Queue', () => {
  beforeEach(async () => {
    const prisma = getPrisma()

    await prisma.soundQueue.deleteMany()
    await prisma.schedule.deleteMany()
    await prisma.sound.deleteMany()
  })

  it('should enqueue a sound', async () => {
    const prisma = getPrisma()

    expect(await prisma.soundQueue.count()).toBe(0)

    const sound = await prisma.sound.create({
      data: {
        fileName: faker.system.commonFileName('mp3'),
        ringerWire: '',
        name: faker.string.alpha()
      }
    })

    await enqueue(sound.id)

    expect(await prisma.soundQueue.count()).toBe(1)
  })

  it('should process the queue', async () => {
    const prisma = getPrisma()

    expect(await prisma.soundQueue.count()).toBe(0)

    const sound = await prisma.sound.create({
      data: {
        fileName: faker.system.commonFileName('mp3'),
        ringerWire: '',
        name: faker.string.alpha()
      }
    })

    await enqueueMany([sound.id, sound.id, sound.id])

    expect(await prisma.soundQueue.count()).toBe(3)

    await processQueue()

    expect(await prisma.soundQueue.count()).toBe(0)
  })
})
