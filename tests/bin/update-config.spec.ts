import {describe, it, vi, expect} from 'vitest'
import {handlers} from '../_helpers/handlers'
import {setupServer} from 'msw/node'
import fs from 'fs'
import path from 'path'

import {updateConfig} from '../../src/bin/update-config'
import {getPrisma} from '../../src/utils/prisma'

const {readdir} = fs.promises

describe('Update Config', () => {
  const server = setupServer(...handlers)

  server.listen()

  it('should update config', async () => {
    const prisma = getPrisma()

    await prisma.schedule.deleteMany()

    const soundCount = await prisma.sound.count()

    expect(await prisma.schedule.count()).toBe(0)

    const dirSize = (await readdir(path.join(process.cwd(), 'sounds'))).length

    vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await updateConfig()

    expect(await prisma.sound.count()).toBe(soundCount + 1)
    expect(await prisma.schedule.count()).toBe(2)
    expect((await readdir(path.join(process.cwd(), 'sounds'))).length).toBe(
      dirSize + 1
    )
  })
})
