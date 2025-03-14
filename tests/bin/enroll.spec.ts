import {describe, it, vi, expect, afterAll} from 'vitest'
import {handlers} from '../_helpers/handlers'
import {setupServer} from 'msw/node'

import {enroll} from '../../src/bin/enroll'

describe('Enroll', () => {
  const server = setupServer(...handlers)

  server.listen()

  it('should enroll the sounder', async () => {
    vi.spyOn(process, 'exit').mockImplementation(() => '' as never)
    const logMock = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await enroll('test-key', 'http://foo')

    expect(logMock).toBeCalledTimes(1)
    expect(logMock).toHaveBeenCalledWith('✅ Sounder Enrolled!')
  })

  afterAll(() => {
    vi.resetAllMocks()
    server.close()
  })
})
