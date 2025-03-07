import path from 'path'
import player from 'play-sound'

const getAudioPlayer = (extname: string) => {
  switch (extname) {
    case '.wav':
      return 'aplay'
    default:
      return 'mpg321'
  }
}

export const playSound = (fileName: string) => {
  player({player: getAudioPlayer(path.extname(fileName))}).play(
    path.join(process.cwd(), 'sounds', fileName)
  )
}
