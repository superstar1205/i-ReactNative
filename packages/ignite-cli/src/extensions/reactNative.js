const { test } = require('ramda')
const exitCodes = require('../lib/exitCodes')

// The default version of React Native to install. We will want to upgrade
// this when we test out new releases and they work well with our setup.
const REACT_NATIVE_VERSION = '0.42.0'

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
  const { parameters, print, system, filesystem, strings, ignite } = context
  const { log } = ignite

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
    const reactNativeTemplate = opts.template || parameters.options['react-native-template']

    // jet if the version isn't available
    const versionCheck = await system.run(`npm info react-native@${reactNativeVersion}`)
    const versionAvailable = test(new RegExp(reactNativeVersion, ''), versionCheck || '')
    if (!versionAvailable) {
      print.error(`💩  react native version ${print.colors.yellow(reactNativeVersion)} not found on NPM -- ${print.colors.yellow(REACT_NATIVE_VERSION)} recommended`)
      return {
        exitCode: exitCodes.REACT_NATIVE_VERSION,
        version: reactNativeVersion,
        template: reactNativeTemplate
      }
    }

    // craft the additional options to pass to the react-native cli
    const rnOptions = [ '--version', reactNativeVersion ]
    if (!strings.isBlank(reactNativeTemplate)) {
      rnOptions.push('--template')
      rnOptions.push(reactNativeTemplate)
    }
    if (opts.skipJest) {
      rnOptions.push('--skip-jest')
    }

    // install React Native CLI if it isn't found
    const rncliSpinner = print.spin(`checking react-native-cli`)
    const cliInstalled = await system.which('react-native')
    if (cliInstalled) {
      rncliSpinner.stop()
    } else {
      // No React Native installed, let's get it
      rncliSpinner.text = 'installing react-native-cli'
      await system.exec('npm install -g react-native-cli', { stdio: 'ignore' })
      rncliSpinner.succeed(`installed react-native-cli`)
    }

    // react-native init
    const cmd = `react-native init ${name} ${rnOptions.join(' ')}`
    log('initializing react native')
    log(cmd)
    const withTemplate = reactNativeTemplate ? ` with ${print.colors.cyan(reactNativeTemplate)} template` : ''
    const spinner = print.spin(`adding ${print.colors.cyan('React Native ' + reactNativeVersion)}${withTemplate} ${print.colors.muted('(60 seconds-ish)')}`)
    if (parameters.options.debug) spinner.stop()

    // ok, let's do this
    const stdioMode = parameters.options.debug ? 'inherit' : 'ignore'
    try {
      await system.exec(cmd, { stdio: stdioMode })
    } catch (e) {
      spinner.fail(`failed to add ${print.colors.cyan('React Native ' + reactNativeVersion)}${withTemplate}`)
      if (reactNativeTemplate) {
        // TODO: we can totally check, just stopping here until while https://github.com/facebook/react-native/pull/12548 settles in.
        const fullTemplateName = `react-native-template-${reactNativeTemplate}`
        spinner.fail(`Does ${print.colors.cyan(fullTemplateName)} exist on npm?`)
      }
      return {
        exitCode: exitCodes.REACT_NATIVE_INSTALL,
        version: reactNativeVersion,
        template: reactNativeTemplate
      }
    }

    // good news everyone!
    const successMessage = `added ${print.colors.cyan('React Native ' + reactNativeVersion)}${withTemplate}`
    spinner.succeed(successMessage)

    // jump immediately into the new directory
    process.chdir(name)
    log(`changed to directory ${process.cwd()}`)

    // Create ./ignite/plugins/.gitkeep
    filesystem.write(`${process.cwd()}/ignite/plugins/.gitkeep`, '')

    return {
      exitCode: exitCodes.OK,
      version: reactNativeVersion,
      template: reactNativeTemplate
    }
  }

  return {
    install
  }
}

module.exports = attach
