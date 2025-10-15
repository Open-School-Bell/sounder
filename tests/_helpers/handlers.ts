import {http, HttpResponse} from 'msw'
import {faker} from '@faker-js/faker'

const soundId = faker.string.uuid()

export const handlers = [
  http.post('*/sounder-api/enroll', async () => {
    return HttpResponse.json({
      id: faker.string.uuid(),
      name: faker.internet.username()
    })
  }),
  http.post('*/sounder-api/ping', async () => {
    return HttpResponse.json({ping: 'pong'})
  }),
  http.post('*/sounder-api/get-config', async () => {
    return HttpResponse.json({
      id: faker.string.uuid(),
      name: faker.internet.username(),
      day: 'null',
      ringerPin: 0,
      screen: false,
      schedules: [],
      lockdown: {
        enable: false,
        entrySound: '',
        exitSound: '',
        times: 1,
        exitTimes: 1,
        interval: 5,
        repeatRingerWire: false
      }
    })
  }),
  http.post('*/sounder-api/log', async () => {
    return HttpResponse.json({status: 'ok'})
  }),
  http.post('*/sounder-api/get-audio', async () => {
    return HttpResponse.json([])
  }),
  http.post('*/sounder-api/get-sounds', async () => {
    return HttpResponse.json([
      {
        id: soundId,
        fileName: faker.system.commonFileName('mp3'),
        ringerWire: '',
        name: faker.string.alpha()
      }
    ])
  }),
  http.get('*/sounds/*.mp3', async () => {
    return HttpResponse.html('foo')
  }),
  http.post('*/sounder-api/get-schedule', async () => {
    return HttpResponse.json([
      {
        time: '08:40',
        day: 'null',
        weekDays: '1,2,3,4,5',
        soundId,
        count: 2
      },
      {
        time: '09:10',
        day: 'null',
        weekDays: '1,2,3,4,5',
        soundId,
        count: 2
      }
    ])
  })
]
