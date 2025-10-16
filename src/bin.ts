import {Command} from 'commander'

import {enroll} from './bin/enroll'
import {sounder} from './sounder'
import {updateConfig, updateController} from './bin/update-config'
import {showConfig} from './bin/show-config'
import {showSounds} from './bin/show-sounds'
import {clearQueue} from './bin/clear-queue'

import {version} from '../package.json'

const program = new Command()

program
  .option('--enroll <key>', 'Enrollment Key')
  .option('-c, --controller <url>', 'Controller URL')
  .option('-s, --start', 'Start the Sounder')
  .option('-u, --update-config', 'Update comfig from the controller')
  .option('--show-config', 'Show the current configuration of the sounder.')
  .option('--show-sounds', 'Show the sounds on the sounder.')
  .option('--clear-queue', 'Clear the sounders play queue.')
  .version(version)

program.parse(process.argv)

const options = program.opts()

if (options.enroll) {
  if (!options.controller) {
    throw new Error('Controller URL must be set')
  }

  void enroll(options.enroll, options.controller)
}

if (options.controller && !options.enroll) {
  void updateController(options.controller)
}

if (options.updateConfig) {
  void updateConfig()
}

if (options.start) {
  void sounder()
}

if (options.showConfig) {
  void showConfig()
}

if (options.showSounds) {
  void showSounds()
}

if (options.clearQueue) {
  void clearQueue()
}
