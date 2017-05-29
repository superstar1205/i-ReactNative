// @cliDescription  Copy templates as blueprints for this project
// ----------------------------------------------------------------------------
const { reduce, find } = require('ramda')
const exitCodes = require('../lib/exitCodes')
const isIgniteDirectory = require('../lib/isIgniteDirectory')

module.exports = async function (context) {
  // ensure we're in a supported directory
  if (!isIgniteDirectory(process.cwd())) {
    context.print.error('The `ignite spork` command must be run in an ignite-compatible directory.')
    process.exit(exitCodes.NOT_IGNITE_PROJECT)
  }

  // grab a fist-full of features...
  const { print, filesystem, parameters } = context
  const { warning, success, info } = print

  // ignite spork
  // -> lists all generator plugins (identified in json)
  const pluginOptions = reduce((a, k) => {
    const jsonFile = `${k.directory}/ignite.json`
    if (filesystem.exists(jsonFile)) {
      const jsonContents = filesystem.read(jsonFile, 'json') || {}
      if (jsonContents.generators) {
        a.push(k.name)
      }
    }
    return a
  }, [], context.ignite.findIgnitePlugins())

  let selectedPlugin = ''
  if (pluginOptions.length === 0) {
    warning('No plugins with generators were detected!')
    process.exit(exitCodes.SPORKABLES_NOT_FOUND)
  } else if (pluginOptions.length === 1) {
    selectedPlugin = pluginOptions[0]
  } else {
    const answer = await context.prompt.ask({
      name: 'selectedPlugin',
      message: 'Which plugin will you be sporking templates from?',
      type: 'list',
      choices: pluginOptions
    })
    selectedPlugin = answer.selectedPlugin
  }

  const directory = find(x => x.name === selectedPlugin, context.ignite.findIgnitePlugins()).directory
  const choices = filesystem.list(`${directory}/templates`)

  // Ask (if necessary)
  let copyFiles
  if (parameters.second) {
    if (choices.includes(parameters.second)) {
      copyFiles = { selectedTemplates: [ parameters.second ] }
    } else {
      warning(`${parameters.second} is not a recognized generator template.`)
      process.exit(exitCodes.SPORKABLES_NOT_FOUND)
    }
  } else {
    copyFiles = await context.prompt.ask({
      name: 'selectedTemplates',
      message: 'Which templates would you like to spork?',
      type: 'checkbox',
      choices
    })
  }

  // TODO: This will be wonky if you're not in root of your project
  copyFiles.selectedTemplates.map((template) => {
    const destination = `ignite/Spork/${selectedPlugin}/${template}`
    filesystem.copyAsync(`${directory}/templates/${template}`, destination)
    info(` 🔘 ${destination}`)
  })

  success('Sporked!')
}
