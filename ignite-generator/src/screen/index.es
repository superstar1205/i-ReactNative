#! /usr/bin/env node
'use strict'

import Generators from 'yeoman-generator'
import * as Utilities from '../utilities'

const copyOverScreenContainer = (context) => {
  // copy screen template
  context.fs.copyTpl(
    context.templatePath('screen.js.template'),
    context.destinationPath(`./App/Containers/${context.name}.js`),
    { name: context.name }
  )

  // copy screen style template
  context.fs.copyTpl(
    context.templatePath('screen-style.js.template'),
    context.destinationPath(`./App/Containers/Styles/${context.name}Style.js`),
    { name: context.name }
  )
}

const addToRoutes = (context) => {
  const newRoute = `  get ${context.name} () {
    return {
      title: '${context.name}',
      component: require('../Containers/${context.name}').default,
      leftButton: 'BACK'
    }
  }
`
  Utilities.insertInFile('App/Navigation/Routes.js', 'get ', newRoute, false)
}

class ScreenGenerator extends Generators.Base {

  constructor (args, options) {
    super(args, options)
    this.argument('name', { type: String, required: true })
  }

  generateApp () {
    // Copy over component files.
    copyOverScreenContainer(this)
  }

  end () {
    // insert screen into routes file
    addToRoutes(this)

    console.log('Time to get cooking! 🍽 ')
  }
}

module.exports = ScreenGenerator
