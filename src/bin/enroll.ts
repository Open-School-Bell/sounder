import fs from 'fs'
import path from 'path'

const {writeFile} = fs.promises

export const enroll = async (key: string, controller: string) => {
  const response = await fetch(`http://${controller}:5173/sounder-api/enroll`, {method: 'post', body: JSON.stringify({
    key
  })})

  const result = await response.json()

  const content = JSON.stringify({...result, controller, key})

  await writeFile(path.join(process.cwd(), 'sounder.json'), content)

  console.dir('✅ Sounder Enrolled!')
  process.exit(0)
}