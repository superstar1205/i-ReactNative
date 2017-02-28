// This is the Ignite extension. It gets parked on `context.ignite` and each
// of the functions defined here are available as functions on that.

// bring in each of the constituents
const ignitePluginPathExt = require('./ignite/ignitePluginPath')
const igniteConfigExt = require('./ignite/igniteConfig')
const findIgnitePluginsExt = require('./ignite/findIgnitePlugins')
const addModuleExt = require('./ignite/addModule')
const removeModuleExt = require('./ignite/removeModule')
const addScreenExamplesExt = require('./ignite/addScreenExamples')
const removeScreenExamplesExt = require('./ignite/removeScreenExamples')
const copyBatchExt = require('./ignite/copyBatch')
const addComponentExampleExt = require('./ignite/addComponentExample')
const removeComponentExampleExt = require('./ignite/removeComponentExample')
const setDebugConfigExt = require('./ignite/setDebugConfig')
const removeDebugConfigExt = require('./ignite/removeDebugConfig')
const patchInFileExt = require('./ignite/patchInFile')
const generateExt = require('./ignite/generate')
const logExt = require('./ignite/log')
const versionExt = require('./ignite/version')
const pluginOverridesExt = require('./ignite/pluginOverrides')

/**
 * Adds ignite goodies
 *
 * @return {Function} A function to attach to the context.
 */
function attach (plugin, command, context) {
  const { parameters, system } = context

  // determine which package manager to use
  const forceNpm = parameters.options.npm

  // should we be using yarn?
  const useYarn = !forceNpm && system.which('yarn')

  // the ignite plugin path
  const {
    ignitePluginPath,
    setIgnitePluginPath
  } = ignitePluginPathExt(plugin, command, context)

  // a 4-pack of ignite config
  const {
    loadIgniteConfig,
    saveIgniteConfig,
    setIgniteConfig,
    removeIgniteConfig
  } = igniteConfigExt(plugin, command, context)

  // here's the extension's abilities
  return {
    ignitePluginPath,
    setIgnitePluginPath,
    useYarn,
    loadIgniteConfig,
    saveIgniteConfig,
    setIgniteConfig,
    removeIgniteConfig,
    findIgnitePlugins: findIgnitePluginsExt(plugin, command, context),
    addModule: addModuleExt(plugin, command, context),
    removeModule: removeModuleExt(plugin, command, context),
    copyBatch: copyBatchExt(plugin, command, context),
    addComponentExample: addComponentExampleExt(plugin, command, context),
    removeComponentExample: removeComponentExampleExt(plugin, command, context),
    addScreenExamples: addScreenExamplesExt(plugin, command, context),
    removeScreenExamples: removeScreenExamplesExt(plugin, command, context),
    setDebugConfig: setDebugConfigExt(plugin, command, context),
    removeDebugConfig: removeDebugConfigExt(plugin, command, context),
    patchInFile: patchInFileExt(plugin, command, context),
    generate: generateExt(plugin, command, context),
    log: logExt(plugin, command, context),
    version: versionExt(plugin, command, context),
    pluginOverrides: pluginOverridesExt(plugin, command, context)
  }
}

module.exports = attach
