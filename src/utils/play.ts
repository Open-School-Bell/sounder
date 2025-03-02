import path from 'path'
import player from 'play-sound'

export const playSound = (id: string) => {
  player().play(path.join(process.cwd(), 'sounds', `${id}.mp3`))
}