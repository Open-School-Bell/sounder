import path from 'path'
import player from 'play-sound'

export const playSound = (fileName: string) => {
  player().play(path.join(process.cwd(), 'sounds', fileName))
}
