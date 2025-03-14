import {describe, it, vi, expect, afterAll} from 'vitest'
import {handlers} from '../_helpers/handlers'
import {setupServer} from 'msw/node'

import {updateConfig} from '../../src/bin/update-config'

describe('Update Config', () => {
  const server = setupServer(...handlers)

  server.listen()

  it('should update config', async () => {
    vi.mock('fs/promises')
    const logMock = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await updateConfig()
  })
})
