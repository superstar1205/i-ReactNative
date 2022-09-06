import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo } from "react"
import {
  AccessibilityProps,
  FlatList,
  ImageStyle,
  Platform,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { AutoImage, Card, Icon, Screen, Text, Toggle } from "../components"
import { translate } from "../i18n"
import { useStores } from "../models"
import { Episode } from "../models/Episode"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { colors, spacing } from "../theme"
import { delay } from "../utils/delay"
import { openLinkInBrowser } from "../utils/open-link-in-browser"

const ICON_SIZE = 24

export const DemoPodcastListScreen = observer(function DemoPodcastListScreen(
  _props: DemoTabScreenProps<"DemoPodcastList">,
) {
  const { episodeStore } = useStores()

  const [refreshing, setRefreshing] = React.useState(false)

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    episodeStore.fetchEpisodes()
  }, [episodeStore])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([episodeStore.fetchEpisodes(), delay(750)])
    setRefreshing(false)
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]}>
      <FlatList<Episode>
        data={episodeStore.episodesForList}
        extraData={episodeStore.favorites.length + episodeStore.episodes.length}
        contentContainerStyle={$flatListContentContainer}
        refreshing={refreshing}
        onRefresh={manualRefresh}
        ListHeaderComponent={
          <View style={$heading}>
            <Text preset="heading" tx="demoPodcastListScreen.title" />
            <View style={[$rowLayout, $toggle]}>
              <Toggle
                value={episodeStore.favoritesOnly}
                onValueChange={() =>
                  episodeStore.setProp("favoritesOnly", !episodeStore.favoritesOnly)
                }
                variant="switch"
                labelTx="demoPodcastListScreen.onlyFavorites"
                accessibilityLabel={translate("demoPodcastListScreen.accessibility.switch")}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <EpisodeCard
            episode={item}
            isFavorite={episodeStore.hasFavorite(item)}
            onPressFavorite={() => episodeStore.toggleFavorite(item)}
          />
        )}
      />
    </Screen>
  )
})

const EpisodeCard = observer(function EpisodeCard({
  episode,
  isFavorite,
  onPressFavorite,
}: {
  episode: Episode
  onPressFavorite: () => void
  isFavorite: boolean
}) {
  const liked = useSharedValue(isFavorite ? 1 : 0)

  // Grey heart
  const animatedLikeButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.EXTEND),
        },
      ],
      opacity: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.CLAMP),
    }
  })

  // Pink heart
  const animatedUnlikeButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: liked.value,
        },
      ],
      opacity: liked.value,
    }
  })

  /**
   * Android has a "longpress" accessibility action. iOS does not, so we just have to use a hint.
   * @see https://reactnative.dev/docs/accessibility#accessibilityactions
   */
  const accessibilityHintProps = useMemo(
    () =>
      Platform.select<AccessibilityProps>({
        ios: {
          accessibilityHint: translate("demoPodcastListScreen.accessibility.cardHint", {
            action: isFavorite ? "unfavorite" : "favorite",
          }),
        },
        android: {
          accessibilityLabel: episode.title,
          accessibilityActions: [
            {
              name: "longpress",
              label: translate("demoPodcastListScreen.accessibility.favoriteAction"),
            },
          ],
          onAccessibilityAction: ({ nativeEvent }) => {
            if (nativeEvent.actionName === "longpress") {
              handlePressFavorite()
            }
          },
        },
      }),
    [episode, isFavorite],
  )

  const handlePressFavorite = () => {
    onPressFavorite()
    liked.value = withSpring(liked.value ? 0 : 1)
  }

  const handlePressCard = () => {
    openLinkInBrowser(episode.enclosure.link)
  }

  return (
    <Card
      style={$item}
      verticalAlignment="force-footer-bottom"
      onPress={handlePressCard}
      onLongPress={handlePressFavorite}
      heading={episode.parsedTitleAndSubtitle.title}
      content={episode.parsedTitleAndSubtitle.subtitle}
      {...accessibilityHintProps}
      RightComponent={
        <AutoImage maxWidth={80} source={{ uri: episode.thumbnail }} style={$itemThumbnail} />
      }
      FooterComponent={
        <View style={$metadata}>
          <Animated.View
            style={[$iconContainer, StyleSheet.absoluteFillObject, animatedLikeButtonStyles]}
          >
            <Icon
              icon="heart"
              size={ICON_SIZE}
              color={colors.palette.neutral800} // dark grey
              onPress={handlePressFavorite}
              accessibilityLabel={
                isFavorite
                  ? undefined
                  : translate("demoPodcastListScreen.accessibility.favoriteIcon")
              }
            />
          </Animated.View>
          <Animated.View style={[$iconContainer, animatedUnlikeButtonStyles]}>
            <Icon
              icon="heart"
              size={ICON_SIZE}
              color={colors.palette.primary400} // pink
              onPress={handlePressFavorite}
              accessibilityLabel={
                isFavorite
                  ? translate("demoPodcastListScreen.accessibility.unfavoriteIcon")
                  : undefined
              }
            />
          </Animated.View>
          <Text size="xs" accessibilityLabel={episode.datePublished.accessibilityLabel}>
            {episode.datePublished.textLabel}
          </Text>
          <Text size="xs" accessibilityLabel={episode.duration.accessibilityLabel}>
            {episode.duration.textLabel}
          </Text>
        </View>
      }
    />
  )
})

// #region Styles
const $flatListContentContainer: ViewStyle = {
  paddingHorizontal: spacing.large,
  paddingVertical: spacing.large,
}

const $heading: ViewStyle = {
  marginBottom: spacing.medium,
}

const $item: ViewStyle = {
  marginTop: spacing.medium,
  minHeight: 120,
}

const $itemThumbnail: ImageStyle = {
  borderRadius: 8,
  alignSelf: "center",
}

const $rowLayout: ViewStyle = {
  flexDirection: "row",
}

const $toggle: ViewStyle = {
  alignItems: "center",
  marginTop: spacing.small,
}

const $iconContainer: ViewStyle = {
  height: ICON_SIZE,
  width: ICON_SIZE,
}

const $metadata: TextStyle = {
  justifyContent: "space-between",
  color: colors.textDim,
  marginTop: spacing.extraSmall,
  flexDirection: "row",
  alignItems: "center",
}
// #endregion
