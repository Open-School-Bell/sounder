import {describe, it, vi, expect} from 'vitest'
import {http, HttpResponse} from 'msw'
import {setupServer} from 'msw/node'

import {log} from '../../src/utils/log'

describe('Log', () => {
  it('should log messages', async () => {
    const mock = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const messages: string[] = []

    const server = setupServer(
      http.post('*/sounder-api/log', async ({request}) => {
        const {message} = (await request.json()) as {message: string}

        messages.push(message)
        return HttpResponse.json({status: 'ok'})
      })
    )
    server.listen()

    await log('Test Message')
    expect(mock).toHaveBeenCalled()
    expect(messages).toHaveLength(1)
    expect(messages[0]).toBe('Test Message')
  })
})
