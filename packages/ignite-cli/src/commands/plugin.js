// @cliDescription Manages ignite plugins
// @cliAlias p
// ----------------------------------------------------------------------------

const exitCodes = require('../lib/exitCodes')
const { pipe, keys, filter, map } = require('ramda')

/**
 * Does a walkthrough of questions and returns the answers as an object.
 *
 * @param {Object} context The gluegun context.
 * @returns {Object} The answers.
 */
const walkthrough = async (context) => {
  const minOptions = { template: 'No', command: 'No' }
  const maxOptions = { template: 'Yes', command: 'Yes' }
  if (context.parameters.options.min) { return minOptions }
  if (context.parameters.options.max) { return maxOptions }

  // Okay, we'll ask one by one, fine
  return await context.prompt.ask([
    {
      name: 'template',
      message: 'Would you like to generate an example component?',
      type: 'list',
      choices: ['No', 'Yes']
    },
    {
      name: 'command',
      message: 'Would you like to generate an example command/generator?',
      type: 'list',
      choices: ['No', 'Yes']
    }
  ])
}

/**
 * Checks whether a plugin name was given and errors if not.
 * Also prepends `ignite-*` if plugin name didn't include it.
 *
 * @param {String} pluginName The provided plugin name.
 * @param {Object} context The gluegun context.
 * @returns {String} The normalized name.
 */
const validateName = (pluginName, context) => {
  const { strings, print } = context

  if (strings.isBlank(pluginName)) {
    print.info(`ignite plugin new ignite-foo\n`)
    print.error('Plugin name is required')
    process.exit(exitCodes.PLUGIN_NAME)
  }

  // TODO: Make this better at detecting invalid plugin names
  if (!/^[a-z0-9].*/i.test(pluginName)) {
    print.error('Plugin name should be a valid folder name')
    process.exit(exitCodes.PLUGIN_NAME)
  }

  // Force prepend `ignite-*` to plugin name
  return /^ignite-/.test(pluginName) ? pluginName : 'ignite-' + pluginName
}

/**
 * Creates a new folder with the plugin files.
 *
 * @param {Object} context The gluegun context.
 */
const createNewPlugin = async (context) => {
  const { parameters, print, ignite, strings } = context
  const pluginName = validateName(parameters.third, context)
  const name = strings.pascalCase(pluginName.replace(/^ignite-/, ''))

  // Plugin generation walkthrough
  const answers = await walkthrough(context)

  // Here we go!
  print.info(`Creating new plugin: ${pluginName}`)

  const copyJobs = [
    { template: 'plugin/.gitignore', target: `${pluginName}/.gitignore` },
    { template: 'plugin/index.js.ejs', target: `${pluginName}/index.js` },
    { template: 'plugin/ignite.toml.ejs', target: `${pluginName}/ignite.toml` },
    { template: 'plugin/package.json.ejs', target: `${pluginName}/package.json` },
    { template: 'plugin/README.md', target: `${pluginName}/README.md` },
    (answers.template === 'Yes') &&
      { template: 'plugin/templates/Example.js.ejs', target: `${pluginName}/templates/${name}Example.js.ejs` },
    (answers.command === 'Yes') &&
      { template: 'plugin/commands/example.js.ejs', target: `${pluginName}/commands/example.js` }
  ]

  // copy over the files
  await ignite.copyBatch(context, copyJobs, {name, pluginName})
}

/**
 * Shows the command help.
 *
 * @param {Object} context The gluegun context.
 */
const showHelp = (context) => {
  const instructions = `
Generates an Ignite-compatible plugin in the current folder.
Generally, you would run this from ./YourApp/ignite/plugins/

Commands:
  ignite plugin help
  ignite plugin new <your-plugin>
  ignite plugin list
  ignite plugin search <search string>
  ignite plugin info <plugin name>

Example:
  ignite plugin new ignite-mobx`
  context.print.info(instructions)
  process.exit(exitCodes.OK)
}

/**
 * Shows a list of known plugins.
 *
 * @param {Object} context The gluegun context.
 * @param {String} search A search string (or null).
 */
const showPluginDirectory = (context, search) => {
  const { print } = context
  const { colors, newline, info, table, error } = print
  const directory = require('./plugin/directory')

  const pluginTable = pipe(
    keys,
    filter((k) => {
      if (!search) return true
      return k.includes(search)
    }),
    map((k) => {
      const plugin = directory[k]
      return [k, plugin.author]
      // return plugin
    })
  )(directory)

  newline()
  info(colors.highlight("Ignite Plugins"))
  newline()
  if (pluginTable.length > 0) {
    info(colors.muted("Install with `ignite add pluginname` and remove with `ignite remove pluginname`"))
    newline()
    table(pluginTable)
  } else {
    error(`No plugin with the search string '${search}'.`)
  }
  newline()

  process.exit(exitCodes.OK)
}

/**
 * Shows info about a particular plugin.
 *
 * @param {Object} context The gluegun context.
 */
const showPluginInfo = (context, name) => {
  const { print } = context
  const { colors, newline, info, table, error } = print
  const directory = require('./plugin/directory')

  name = validateName(name, context)
  shortName = name.replace(/^(ignite\-)/, "")

  const plugin = directory[name]
  
  newline()
  info(colors.highlight(`Ignite Plugin: '${name}'`))
  newline()

  if (plugin) {
    table([
      [ "Name", name ],
      [ "Description", plugin.description ],
      [ "Author", plugin.author ],
      [ "URL", plugin.url ],
      [ "Email", plugin.email ]
    ])
  } else {
    error('ok')
  }

  newline()
  info("Install with " + colors.highlight(`ignite add ${shortName}`))
  newline()
}


module.exports = async function (context) {
  const { parameters, print } = context

  switch (parameters.second) {
    case 'new':
      await createNewPlugin(context)
      break

    case 'list':
      showPluginDirectory(context, null)
      break

    case 'search':
      showPluginDirectory(context, parameters.third)
      break

    case 'info':
      showPluginInfo(context, parameters.third)
      break

    case 'help':
    default:
      showHelp(context)
      break
  }
}

