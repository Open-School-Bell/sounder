import {getPrisma, getSetting} from '../utils/prisma'
import {title} from '../utils/cli'

export const showToday = async () => {
  const prisma = getPrisma()
  const date = new Date()

  const currentDay = await getSetting('currentDay')
  const dayNumber = `${date.getDay() === 0 ? 7 : date.getDay()}`

  title('Current Day Times')

  const schedules = (
    await prisma.schedule.findMany({
      where: {day: currentDay},
      orderBy: {time: 'asc'}
    })
  ).filter(schedule => {
    return schedule.weekDays.split(',').includes(dayNumber)
  })

  console.table(
    schedules.map(({time, sequence}) => {
      return {time, sequence}
    })
  )
}
