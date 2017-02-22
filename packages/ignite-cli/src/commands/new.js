// @cliDescription  Generate a new React Native project with Ignite.
// @cliAlias n
// ----------------------------------------------------------------------------
const exitCodes = require('../lib/exitCodes')
const path = require('path')
const header = require('../brand/header')
const { forEach } = require('ramda')

module.exports = async function (context) {
  const { parameters, strings, print, system, filesystem, ignite } = context
  const { isBlank } = strings
  const { log } = ignite

  // grab the project name
  const projectName = parameters.second

  // verify the project name is a thing
  if (isBlank(projectName)) {
    print.info(`${context.runtime.brand} new <projectName>\n`)
    print.error('Project name is required')
    process.exit(exitCodes.PROJECT_NAME)
    return
  }

  // verify the directory doesn't exist already
  if (filesystem.exists(projectName) === 'dir') {
    print.error(`Directory ${projectName} already exists.`)
    process.exit(exitCodes.DIRECTORY_EXISTS)
  }

  // make & jump into the project directory
  log(`making directory ${projectName}`)
  filesystem.dir(projectName)
  process.chdir(projectName)
  log(`switched directory to ${process.cwd()}`)

  // make a temporary package.json file so node stops walking up the diretories
  filesystem.write('package.json', {
    name: 'ignite-shim',
    description: 'A temporary package.json created to prevent node from wandering too far.',
    repository: 'infinitered/ignite',
    license: 'MIT'
  })

  // pretty bird, yes, pretty bird... petey is a pretty bird.
  if (!parameters.options.debug) {
    header()
    print.newline()
  }
  print.info(`🔥 igniting app ${print.colors.yellow(projectName)}`)

  /**
   * Figures out which app template we'll be using (without the ignite- prefix).
   *
   * @return {string} The app template we'll be using.
   */
  function getAppTemplate () {
    // check for a user-defined template
    const cliTemplate = parameters.options.template || parameters.options.t
    if (cliTemplate) return cliTemplate

    // check for the minimal app template
    if (parameters.options.min || parameters.options.m) return 'minimal-app-template'

    // check for the empty app template
    if (parameters.options.empty) return 'empty-app-template'

    // default
    return 'unholy-app-template'
  }

  // grab the right app template
  const appTemplatePackage = getAppTemplate()

  // Install the ignite-* packages from the local dev directory.
  //
  // This is pretty much always what we while we dev.
  //
  // To test what live is like, you can run `ignite new FooTown --live`.
  //
  // TODO(steve): Don't forget to remove this when we launch... open to better ways of handling it.
  const igniteDevPackagePrefix = parameters.options.live || path.resolve(`${__dirname}/../../..`) + '/ignite-'

  // some extra options we'll be passing through to the `ignite add <app-template>`
  const extraAddOptions = ['--is-app-template']

  // pass along the ignite prefix if we have it
  if (!parameters.options.live) {
    extraAddOptions.push(`--ignite-dev-package-prefix ${igniteDevPackagePrefix}`)
  }

  // pass through the --max flag
  // NOTE(steve):
  //   I'd like to see this go away by introducing a new addTemplate command... baby steps though.
  //   Another thing to consider is just passing through *all* options.
  if (parameters.options.max) extraAddOptions.push('--max')

  // pass debug down the chain
  if (parameters.options.debug) extraAddOptions.push('--debug')

  // pass react-native version down the chain
  if (parameters.options['react-native-version']) extraAddOptions.push(`--react-native-version ${parameters.options['react-native-version']}`)

  // let's kick off the template
  let ok = false
  try {
    const command = `ignite add ${igniteDevPackagePrefix}${appTemplatePackage} ${projectName} ${extraAddOptions.join(' ')}`
    log(`running app template: ${command}`)
    await system.spawn(command, { stdio: 'inherit' })
    log('finished app template')
    ok = true
  } catch (e) {
    log('error running app template')
    log(e.message)
  }

  // always clean up the app-template stuff
  log('cleaning temporary files')
  filesystem.remove('node_modules')
  filesystem.remove('ignite')
  filesystem.remove('package.json')

  // did we install everything successfully?
  if (ok) {
    log(`moving contents of ${projectName} into place`)
    // move everything that's 1 deep back up to here
    forEach(
      filename => filesystem.move(path.join(projectName, filename), filename)
      , filesystem.list(projectName)
    )
    log(`removing unused sub directory ${projectName}`)
    filesystem.remove(projectName)
  }
  log('finished running new')
}
