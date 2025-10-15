import {describe, it, vi, expect, afterAll} from 'vitest'
import {handlers} from '../_helpers/handlers'
import {setupServer} from 'msw/node'

import {enroll} from '../../src/bin/enroll'
import {getSettings} from '../../src/utils/prisma'

describe('Enroll', () => {
  const server = setupServer(...handlers)

  server.listen()

  it('should enroll the sounder', async () => {
    vi.spyOn(process, 'exit').mockImplementation(() => '' as never)
    const logMock = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await enroll('test-key', 'http://foo')

    expect(logMock).toBeCalledTimes(4)

    const {sounderKey, controllerAddress} = await getSettings([
      'sounderKey',
      'controllerAddress'
    ])

    expect(sounderKey).toBe('test-key')
    expect(controllerAddress).toBe('http://foo')
  })

  afterAll(() => {
    vi.resetAllMocks()
    server.close()
  })
})
