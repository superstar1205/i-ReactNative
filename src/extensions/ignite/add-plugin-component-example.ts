import { IgniteToolbox } from '../../types'
import * as path from 'path'

export default (toolbox: IgniteToolbox) => {
  /**
   * Generates an example for use with the dev screens.
   */
  async function addPluginComponentExample(fileName: string, props: Object = {}) {
    const { filesystem, ignite, print, template } = toolbox
    const { ignitePluginPath } = ignite
    const config = ignite.loadIgniteConfig()

    let templateFile: string
    if (fileName.endsWith('.ejs')) {
      templateFile = fileName
    } else {
      print.warning(
        `DEPRECATION WARNING: addPluginComponentExample called with '${fileName}' and no .ejs extension. Add .ejs to your template filename when calling this function.`,
      )
      templateFile = `${fileName}.ejs`
    }

    const fileNameNoExt = path.basename(templateFile, '.ejs')

    // do we want to use examples in the classic format?
    if (config.examples === 'classic') {
      const spinner = print.spin(`▸ adding component example`)

      // generate the file
      const templatePath = ignitePluginPath() ? `${ignitePluginPath()}/templates` : `templates`
      await template.generate({
        directory: templatePath,
        template: templateFile,
        target: `ignite/Examples/Components/${fileNameNoExt}`,
        props,
      })

      // adds reference to usage example screen (if it exists)
      const destinationPath = `${process.cwd()}/ignite/DevScreens/PluginExamplesScreen.js`
      if (filesystem.exists(destinationPath)) {
        ignite.patchInFile(destinationPath, {
          after: 'import ExamplesRegistry',
          insert: `import '../Examples/Components/${fileNameNoExt}'`,
        })
      }
      spinner.stop()
    }
  }

  return addPluginComponentExample
}
