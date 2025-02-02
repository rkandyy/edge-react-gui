import * as React from 'react'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'
import { Card } from './Card'

type Props = {
  children: React.ReactNode
  disabled?: boolean
  onPress?: () => void
  warning?: boolean
  marginRem?: number[] | number
  paddingRem?: number[] | number
}

/**
 * An (optionally) tappable card that displays its children in up to two left/right
 * sections. If the card is configured to be tappable, a chevron is drawn on the
 * right side of the card.
 */
const TappableCardComponent = ({ children, disabled = false, onPress, ...cardProps }: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <TouchableOpacity onPress={disabled ? undefined : onPress}>
      <Card {...cardProps}>
        <View style={styles.container}>
          <View style={styles.childrenContainer}>{children}</View>
          {onPress == null ? null : <FontAwesome5 name="chevron-right" size={theme.rem(1.25)} color={theme.iconTappable} style={styles.chevron} />}
        </View>
      </Card>
    </TouchableOpacity>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flexDirection: 'row'
  },
  childrenContainer: {
    flexDirection: 'row',
    flex: 1
  },
  chevron: {
    alignSelf: 'center'
  }
}))

export const TappableCard = React.memo(TappableCardComponent)
