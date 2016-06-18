#! /usr/bin/env node
'use strict'

import { NamedBase } from 'yeoman-generator'

const copyOverListView = (context) => {
  // copy listview template
  context.fs.copyTpl(
    context.templatePath('listview.js.template'),
    context.destinationPath(`./App/Containers/${context.name}.js`),
    { name: context.name }
  )

  // copy listview style template
  context.fs.copyTpl(
    context.templatePath('listview-style.js.template'),
    context.destinationPath(`./App/Containers/Styles/${context.name}Style.js`),
    { name: context.name }
  )
}

class ContainerGenerator extends NamedBase {

  prompting () {
    // supposidly returning the prompt stops it from moving forward
    // doesn't seem to work
    return this.prompt({
      type: 'list',
      name: 'listviewtype',
      message: 'What kind of listview would you like to generate?',
      choices: ['Row List', 'Grid List'],
      store: true
    }, (answers, error) => {
      this.log('ANSWERS', answers)
      if (answers.listviewtype === 'Row List') {
        this.log('Create a Row Listview')
        // copyOverListView(this)
      } else {
        this.log('Create a Grid Listview')
      }
    })
  }

  end () {
    this.log('Time to get cooking! 🍽 ')
  }
}

module.exports = ContainerGenerator
