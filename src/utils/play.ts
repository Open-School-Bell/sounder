import path from 'path'
import player from 'play-sound'

export const getAudioPlayer = (extname: string) => {
  switch (extname) {
    case '.wav':
      return 'aplay'
    default:
      return undefined
  }
}

export const playSound = async (fileName: string) => {
  const filePath = path.join(process.cwd(), 'sounds', fileName)

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
