import {title} from '../utils/cli'

import {getPrisma} from '../utils/prisma'

export const showConfig = async () => {
  title('Current Configuration')

  const prisma = getPrisma()

  const settings = await prisma.config.findMany({
    orderBy: {key: 'asc'},
    select: {key: true, value: true}
  })

  console.table(
    settings.map(({key, value}) => {
      return {key, value: JSON.parse(value)}
    })
  )
}
