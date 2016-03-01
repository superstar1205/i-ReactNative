// import { Transitions } from '../Themes/'

export default new class Routes {

  // Here are the "Containers" in our app (e.g. Screens).
  //
  // These routes are implemented as getter functions
  // because I like the simple calling notation, but
  // they're lazily evaluated to prevent recursion
  // when the screens themselves use this Routes file.

  get AllComponentsScreen () {
    return {
      title: 'Welcome',
      component: require('../Containers/AllComponentsScreen').default
    }
  }

}
