import qrcodeGenerator from 'qrcode-generator'
import * as React from 'react'
import { ActivityIndicator, TouchableWithoutFeedback, View } from 'react-native'
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'

import { fixSides, mapSides, sidesToMargin } from '../../util/sides'
import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'

type Props = {
  data?: string // Nothing will show if undefined
  cellsPadding?: number // In QR cells
  marginRem?: number[] | number
  onPress?: () => void
}

export function QrCode(props: Props) {
  const theme = useTheme()
  const styles = getStyles(theme)
  const { data, cellsPadding = 1, marginRem, onPress } = props
  const margin = sidesToMargin(mapSides(fixSides(marginRem, 2), theme.rem))

  // Scale the surface to match the container's size (minus padding):
  const [containerHeight, setContainerHeight] = React.useState<number>(0)
  const size = containerHeight - theme.rem(1)

  const handleLayout = (event: any) => {
    setContainerHeight(event.nativeEvent.layout.height)
  }

  // Generate an SVG path:
  const code = qrcodeGenerator(0, 'H')
  code.addData(data ?? '')
  code.make()
  const svg = code.createSvgTag(1, cellsPadding)
  const path = svg.replace(/.*d="([^"]*)".*/, '$1')

  // Handle animation:
  const derivedData = useDerivedValue(() => data)
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: withTiming(derivedData.value != null ? 1 : 0)
  }))

  // Create a drawing transform to scale QR cells to device pixels:
  const sizeInCells = code.getModuleCount() + 2 * cellsPadding
  const viewBox = `0 0 ${sizeInCells} ${sizeInCells}`

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[styles.container, margin]} onLayout={handleLayout}>
        <ActivityIndicator color={theme.iconTappable} />
        <Animated.View style={[styles.whiteBox, fadeStyle]}>
          {size <= 0 ? null : (
            <Svg height={size} width={size} viewBox={viewBox}>
              <Path d={path} fill={theme.qrForegroundColor} />
            </Svg>
          )}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    aspectRatio: 1,
    flex: 1,
    justifyContent: 'center'
  },
  whiteBox: {
    backgroundColor: theme.qrBackgroundColor,
    borderRadius: theme.rem(0.5),
    bottom: 0,
    left: 0,
    padding: theme.rem(0.5),
    position: 'absolute',
    right: 0,
    top: 0
  }
}))
