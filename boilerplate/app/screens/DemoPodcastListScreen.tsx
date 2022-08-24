import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FlatList, Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Icon, Screen, Text } from "../components"
import { useStores } from "../models"
import { Episode } from "../models/Episode"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { colors, spacing } from "../theme"
import { delay } from "../utils/delay"

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
        data={episodeStore.episodes}
        extraData={episodeStore.favorites.length}
        contentContainerStyle={$flatListContentContainer}
        refreshing={refreshing}
        onRefresh={manualRefresh}
        ListHeaderComponent={
          <View style={$heading}>
            <Text preset="heading" tx="demoPodcastListScreen.title" />
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
  return (
    <View style={[$rowLayout, $item]}>
      <View style={$description}>
        <Text>{episode.title}</Text>
        <View style={[$rowLayout, $metadata]}>
          <Icon
            icon="heart"
            color={isFavorite ? colors.palette.primary400 : undefined}
            onPress={onPressFavorite}
          />
          <Text size="xs">{episode.datePublished}</Text>
          <Text size="xs">{episode.duration}</Text>
        </View>
      </View>
      <Image source={{ uri: episode.thumbnail }} style={$itemThumbnail} />
    </View>
  )
})

const THUMBNAIL_DIMENSION = 100

const $flatListContentContainer: ViewStyle = {
  paddingHorizontal: spacing[5],
  paddingTop: spacing[5],
}

const $heading: ViewStyle = {
  marginBottom: spacing[4],
}

const $description: TextStyle = {
  flex: 1,
  justifyContent: "space-between",
}

const $item: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing[4],
  marginTop: spacing[4],
}

const $rowLayout: ViewStyle = {
  flexDirection: "row",
}

const $itemThumbnail: ImageStyle = {
  width: THUMBNAIL_DIMENSION,
  height: THUMBNAIL_DIMENSION,
  marginStart: spacing[2],
}

const $metadata: TextStyle = {
  justifyContent: "space-between",
  color: colors.textDim,
  marginTop: spacing[2],
}
