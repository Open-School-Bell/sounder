import {describe, it, vi, expect} from 'vitest'
import {playSound, getAudioPlayer} from '../../src/utils/play'

describe('Play', () => {
  it('should slect the right audio player', () => {
    expect(getAudioPlayer('.wav')).toBe('aplay')
    expect(getAudioPlayer('.mp3')).toBeUndefined()
  })

  it('should play a sound', async () => {
    vi.mock('play-sound', () => {
      return {
        default: () => {
          return {
            play: (filePath: string, options: object, cb: () => void) => {
              expect(filePath).toContain('sample.wav')
              cb()
            }
          }
        }
      }
    })

    await playSound('sample.wav')
  })
})
