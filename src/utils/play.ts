import path from 'path'
import player from 'play-sound'

const getAudioPlayer = (extname: string) => {
  switch (extname) {
    case '.wav':
      return 'aplay'
    default:
      return undefined
  }
}

export const playSound = async (fileName: string, repeat: number = 1) => {
  const filePath = path.join(process.cwd(), 'sounds', fileName)

  if (repeat > 1) {
    let playCount = 0
    while (playCount < repeat) {
      await playSound(fileName)
      playCount += 1
    }
  }

  return new Promise<void>(resolve => {
    player({player: getAudioPlayer(path.extname(fileName))}).play(
      filePath,
      {},
      () => {
        resolve()
      }
    )
  })
}
