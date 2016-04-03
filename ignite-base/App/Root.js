import React, { View, Text, Navigator, StatusBar } from 'react-native'
import {Router, Routes, NavigationBar} from './Navigation/'
import configureStore from './Store/Store'
import { Provider } from 'react-redux'
import Actions from './Actions/Creators'
import Drawer from 'react-native-drawer'

// Styles
import styles from './Containers/Styles/RootStyle'

const store = configureStore()

export default class RNBase extends React.Component {

  componentWillMount () {
    const { dispatch } = store
    dispatch(Actions.startup())
  }

  componentDidMount () {
    this.navigator.drawer = this.drawer
  }

  renderDrawerContent () {
    return (
      <View style={{marginTop: 30, padding: 10}}>
        <Text>
          Drawer Content
        </Text>
      </View>
    )
  }

  renderApp () {
    return (
      <Provider store={store}>
        <View style={styles.applicationView}>
          <StatusBar
            barStyle='light-content'
          />

          <Drawer
            ref={(ref) => { this.drawer = ref }}
            content={this.renderDrawerContent()}
            style={styles.drawer}
            openDrawerOffset={100}
            type='static'
            tapToClose
          >
            <Navigator
              ref={(ref) => { this.navigator = ref }}
              initialRoute={Routes.AllComponentsScreen}
              configureScene={Router.configureScene}
              renderScene={Router.renderScene}
              navigationBar={NavigationBar.render()}
              style={styles.container}
            />
          </Drawer>
        </View>
      </Provider>
    )
  }

  render () {
    return this.renderApp()
  }
}
