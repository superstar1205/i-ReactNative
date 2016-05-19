import { StyleSheet } from 'react-native'
import { Colors, Metrics, Fonts, Base } from '../../Themes/'

export default StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Metrics.navBarHeight,
    backgroundColor: Colors.background
  },
  sectionHeader: {
    ...Base.sectionHeader
  },
  subtitle: {
    ...Base.subtitle
  }
})
