<p align="center">
  <a href="https://infinite.red/ignite"><img src="https://raw.githubusercontent.com/infinitered/ignite/master/_art/in_use.jpg" alt="React Native Ignite logo" width="300px"></a>
</p>

<p align="center">
  :fire: The ideal starting app for React Native, best practices, generators, and more. :fire:
  <br/>
  <a href="https://www.codacy.com/app/gantman/ignite?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=infinitered/ignite&amp;utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/1c6e04abe7224bdc88095129b5eb43fb"/></a>
  <img src=https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat alt='js-standard-style'/>
  <img src=https://semaphoreci.com/api/v1/ir/ignite/branches/master/shields_badge.svg alt='Build Status'/>
  <a href="https://badge.fury.io/js/react-native-ignite"><img src="https://badge.fury.io/js/react-native-ignite.svg" alt="npm version" height="20"></a>

</p>

#### :earth_americas: [Tour Video and More on Ignite Web Page](https://infinite.red/ignite)

### Why Ignite?
* **No Need to Fork!**  Command-line Generator
  * Apps
  * Components/Styles
  * Containers (smart components)
  * Screens (opinionated containers)
  * _and more..._
* JS Code Standard - Standard Compliant
* ALL CODE works with iOS and Android
* Documented Structure
* **Battle Tested** - We use this!
* Redux State Management
* Optional Redux Persistence (uses AsyncStorage via [redux-persist](https://github.com/rt2zz/redux-persist))
* Sagas Redux Daemons
* Githooks
* Mocha Tests
* API Ready
* Reactotron Ready
* Include Common Libs:
  * [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons)
  * [react-native-animatable](https://github.com/oblador/react-native-animatable)
  * [react-native-i18n](https://github.com/AlexanderZaytsev/react-native-i18n)
  * [react-native-push-notification](https://github.com/zo0r/react-native-push-notification)
  * [react-native-drawer](https://github.com/root-two/react-native-drawer)
  * [apisauce](https://github.com/skellock/apisauce)
  * [reactotron](https://github.com/skellock/reactotron)
  * [reduxsauce](https://github.com/skellock/reduxsauce)

To view the generated example project, just pull down the code and run ignite-base!

## :arrow_down: Install

Make sure you're setup for [React Native](https://facebook.github.io/react-native/docs/getting-started.html#content)

**Step 1: Install**

`npm install -g react-native-ignite`

**Step 2: Use**

`ignite new MyApplication`

![install](_art/install.gif)

## :arrow_forward: How to Run Generated App

1. cd to the repo
2. Run Build for either OS
  * for iOS
    * run the command `react-native run-ios`
  * for Android
    * Run Genymotion
    * run the command `react-native run-android`
3. _**Enjoy!**_

![install](_art/screens.gif)

## :arrow_up: Built-In Generators

#### Generate an app: `ignite new MyApplication`
* The application generator uses the `ignite-base` template to provide a fresh application with all the common tech wired up and ready to roll.  Base applications come with common development screens, tools, and components.  _As for now, this is a 'Kitchen Sink' plan of attack.  Eventually to be paired down, and adjustable in v2.0_

#### Generate a component: `ignite generate component SmoothButton`
* The component generator creates a new 'dumb component' with the stylesheet.  Both files are created and placed in their appropriate folders.

#### Generate a container: `ignite generate container SubMenu`
* A generated container is a smart component that is connected to Redux.  Usually for containing other components.  The component and stylesheet are placed in the `Containers` folder.

#### Generate a screen: `ignite generate screen Settings`
* A generated screen, is an opinionated container, with a generated route.  Keyboard avoiding, and other base code is placed in this connected smart component.

#### Generate a listview: `ignite generate listview HotDates`
* React Native listview container with easy step by step instructions on how to get started with an easy list template.

## :twisted_rightwards_arrows: Where to Go From Here
#### [Chosen Tech Docs](https://github.com/infinitered/ignite/wiki/Chosen-Tech) - Understand the Tech Inside
#### [Roadmap Wiki Page](https://github.com/infinitered/ignite/wiki/Roadmap) - Future Plans of Ignite
#### [Who are We?](https://infinite.red) - Learn More About Infinite Red
#### [Project Web Page](http://infinitered.github.io/ignite/) - Our Github Page
