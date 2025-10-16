import {getPrisma} from '../utils/prisma'

export const clearQueue = async () => {
  const prisma = getPrisma()

  await prisma.soundQueue.deleteMany()

  return
}
