const { test } = require('ramda')
const exitCodes = require('../lib/exitCodes')

// The default version of React Native to install. We will want to upgrade
// this when we test out new releases and they work well with our setup.
const REACT_NATIVE_VERSION = '0.41.2'

/**
 * Attach this extension to the context.
 *
 * @param   {any} plugin  - The current running plugin.
 * @param   {any} command - The current running command.
 * @param   {any} context - The active context.
 * @returns {any}         - The public-facing features this supports.
 */
function attach (plugin, command, context) {
  // fist-full o features
  const { parameters, print, system, filesystem, strings } = context

  /**
   * Installs React Native.
   *
   * @param {Object}  opts          - The options to pass to install react native.
   * @param {string}  opts.name     - What to call this project.
   * @param {string}  opts.version  - The React Native version to install (if we care).
   * @param {string}  opts.template - The template to pass to React Native (if any).
   * @param {boolean} opts.skipJest - Should we bypass jest?
   * @returns {number}              - The error code we should exit with if non-0.
   */
  async function install (opts = {}) {
    //  grab the name & version
    const name = opts.name || parameters.third
    const reactNativeVersion = opts.version || parameters.options['react-native-version'] || REACT_NATIVE_VERSION

    // jet if the version isn't available
    const versionCheck = await system.run(`npm info react-native@${reactNativeVersion}`)
    const versionAvailable = test(new RegExp(reactNativeVersion, ''), versionCheck || '')
    if (!versionAvailable) {
      print.error(`💩  react native version ${print.colors.yellow(reactNativeVersion)} not found on NPM -- ${print.colors.yellow(REACT_NATIVE_VERSION)} recommended`)
      return exitCodes.REACT_NATIVE_VERSION
    }

    // ok, let's do this
    const spinner = print.spin(`adding ${print.colors.cyan('React Native ' + reactNativeVersion)} ${print.colors.muted('(~60 seconds)')}`)

    // craft the additional options to pass to the react-native cli
    const rnOptions = [ '--version', reactNativeVersion ]
    if (!strings.isBlank(opts.template)) {
      rnOptions.push('--template')
      rnOptions.push(opts.template)
    }
    if (opts.skipJest) {
      rnOptions.push('--skip-jest')
    }

    // react-native init
    const cmd = `react-native init ${name} ${rnOptions.join(' ')}`
    await system.run(cmd)

    // good news everyone!
    spinner.succeed(`added ${print.colors.cyan('React Native ' + reactNativeVersion)}`)

    // jump immediately into the new directory
    process.chdir(name)

    // Create ./ignite/plugins/.gitkeep
    filesystem.write(`${process.cwd()}/ignite/plugins/.gitkeep`, '')

    return 0
  }

  return {
    install
  }
}

module.exports = attach
