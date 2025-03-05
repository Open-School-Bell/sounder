import {Command} from 'commander'

import {enroll} from './bin/enroll'
import {sounder} from './sounder'

const program = new Command()

program
  .option('--enroll <key>', 'Enrollment Key')
  .option('--controller <url>', 'Controller URL')
  .option('-s, --start', 'Start the Sounder')
  .version('0.0.0')

program.parse(process.argv)

const options = program.opts()

if (options.enroll) {
  if (!options.controller) {
    throw new Error('Controller URL must be set')
  }

  enroll(options.enroll, options.controller)
}

if (options.start) {
  sounder()
}
