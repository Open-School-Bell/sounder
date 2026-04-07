import {Command} from 'commander'

import {enroll, enrollWithConfig} from './bin/enroll'
import {sounder} from './sounder'
import {updateConfig, updateController} from './bin/update-config'
import {showConfig} from './bin/show-config'
import {showSounds} from './bin/show-sounds'
import {clearQueue} from './bin/clear-queue'
import {showToday} from './bin/show-today'
import {configKey, setConfigKey} from './bin/config'
import {docker} from './bin/docker'
import {healthCheck} from './bin/health-check'

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
  .option('--show-today', 'Show todays bell schedule.')
  .option(
    '-k, --config-key <key>',
    'Returns the config keys value, if --value is set the value will be set to the new one.'
  )
  .option(
    '-v, --value <value>',
    'Set the config keys (-k/--config-key) value to the supplied value.'
  )
  .option(
    '--enroll-with-config',
    'Use the config set by -k and -v to enroll the sounder.'
  )
  .option(
    '-d, --docker',
    'Same as -s but can be launched unconfigured/enrolled.'
  )
  .option('-h, --health-check', 'Run a health check on the sounder.')
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

if (options.showToday) {
  void showToday()
}

if (options.configKey) {
  if (options.value) {
    void setConfigKey(options.configKey, options.value)
  } else {
    void configKey(options.configKey)
  }
}

if (options.enrollWithConfig) {
  void enrollWithConfig()
}

if (options.docker) {
  void docker()
}

if (options.healthCheck) {
  void healthCheck()
}
