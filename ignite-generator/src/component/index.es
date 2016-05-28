#! /usr/bin/env node
'use strict'

import { NamedBase } from 'yeoman-generator'

const copyOverCompoment = (context) => {
  // copy component template
  context.fs.copyTpl(
    context.templatePath(`component.js.template`),
    context.destinationPath(`./App/Components/${context.name}.js`),
    { name: context.name }
  )

  // copy component style template
  context.fs.copyTpl(
    context.templatePath(`component-style.js.template`),
    context.destinationPath(`./App/Components/Styles/${context.name}Style.js`),
    { name: context.name }
  )
}

class ComponentGenerator extends NamedBase {

  generateApp () {
    // Copy over component files.
    copyOverCompoment(this)
  }

  end () {
    console.log('Time to get cooking! 🍽 ')
  }
}

module.exports = ComponentGenerator
