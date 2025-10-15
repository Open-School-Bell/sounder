import {title} from '../utils/cli'

import {getPrisma} from '../utils/prisma'

export const showSounds = async () => {
  title('Current Configuration')

  const prisma = getPrisma()

  const sounds = await prisma.sound.findMany({
    orderBy: {name: 'asc'},
    select: {name: true, id: true}
  })

  console.table(
    sounds.map(({name, id}) => {
      return {id, name}
    })
  )
}
