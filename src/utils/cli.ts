import chalk from 'chalk'

const APPNAME = 'Open School Bell Sounder'

const centre = (text: string, width: number) => {
  let [left, right] = ['', '']

  const padLeftBy = (width - text.length) / 2

  left = left.padEnd(padLeftBy)
  right = right.padStart(width - (text.length + padLeftBy))

  return left + text + right
}

export const title = (heading: string) => {
  const width = Math.max(APPNAME.length, heading.length) + 6
  console.log(chalk.blue('-'.repeat(width)))
  console.log(chalk.blue(centre(APPNAME, width)))
  console.log(centre(heading, width))
  console.log(chalk.blue('-'.repeat(width)))
}

export const step = (description: string, width: number = 40) => {
  process.stdout.write(`${description}`)

  const dots = '.'.repeat(width - description.length - 5)

  return () => {
    process.stdout.write(`${dots}${chalk.green('done')}.`)
    process.stdout.write('\n')
  }
}
