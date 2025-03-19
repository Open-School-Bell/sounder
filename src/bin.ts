import {Command} from 'commander'

import {enroll} from './bin/enroll'
import {sounder} from './sounder'
import {updateConfig, updateController} from './bin/update-config'

import {version} from '../package.json'

const program = new Command()

program
  .option('--enroll <key>', 'Enrollment Key')
  .option('-c, --controller <url>', 'Controller URL')
  .option('-s, --start', 'Start the Sounder')
  .option('-u, --update-config', 'Update comfig from the controller')
  .version(version)

program.parse(process.argv)

const options = program.opts()

if (options.enroll) {
  if (!options.controller) {
    throw new Error('Controller URL must be set')
  }

  void enroll(options.enroll, options.controller)
}

if (options.controller) {
  void updateController(options.controller)
}

if (options.updateConfig) {
  void updateConfig()
}

if (options.start) {
  void sounder()
}
