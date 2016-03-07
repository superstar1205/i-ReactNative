import React from 'react-native'
import { Fonts, Metrics, Colors } from '../Themes/'

const NavigationStyle = React.StyleSheet.create({
  titleWrapper: {
    flex: 1,
    padding: Metrics.baseMargin,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  navTitle: {
    color: Colors.snow,
    fontSize: Metrics.fonts.regular,
    fontFamily: Fonts.bold,
    justifyContent: 'center',
    alignSelf: 'center'
  },
  navSubtitle: {
    flex: 1,
    color: Colors.white,
    fontSize: Metrics.fonts.medium,
    fontFamily: Fonts.base,
    alignSelf: 'center'
  },
  backButtonText: {
    color: Colors.white,
    marginTop: 8,
    marginLeft: 8,
    fontFamily: Fonts.bold,
    padding: Metrics.baseMargin
  },
  navigationBar: {
    backgroundColor: Colors.ocean
  }
})

export default NavigationStyle
