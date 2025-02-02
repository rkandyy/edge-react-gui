import { add, gt } from 'biggystring'
import { EdgeCurrencyWallet, EdgeDenomination } from 'edge-core-js'
import * as React from 'react'
import { Image, ScrollView, View } from 'react-native'
import { sprintf } from 'sprintf-js'

import { refreshAllFioAddresses } from '../../actions/FioAddressActions'
import fioLogo from '../../assets/images/fio/fio_logo.png'
import { getSymbolFromCurrency, STAKING_BALANCES } from '../../constants/WalletAndCurrencyConstants'
import { useWatch } from '../../hooks/useWatch'
import { formatNumber, formatTimeDate } from '../../locales/intl'
import s from '../../locales/strings'
import { getDisplayDenomination, getExchangeDenomination } from '../../selectors/DenominationSelectors'
import { convertCurrency } from '../../selectors/WalletSelectors'
import { connect } from '../../types/reactRedux'
import { Actions, RouteProp } from '../../types/routerTypes'
import { convertNativeToDenomination } from '../../util/utils'
import { SceneWrapper } from '../common/SceneWrapper'
import { cacheStyles, Theme, ThemeProps, withTheme } from '../services/ThemeContext'
import { ClickableText } from '../themed/ClickableText'
import { EdgeText } from '../themed/EdgeText'
import { MainButton } from '../themed/MainButton'
import { SceneHeader } from '../themed/SceneHeader'
import { Tile } from '../tiles/Tile'

type OwnProps = {
  route: RouteProp<'fioStakingOverview'>
}
type StateProps = {
  currencyWallet: EdgeCurrencyWallet
  stakingCryptoAmountFormat: string
  stakingFiatBalanceFormat: string
  currencyDenomination: EdgeDenomination
  fiatCurrencyCode: string
  fiatSymbol: string
}
type DispatchProps = {
  refreshAllFioAddresses: () => void
}
type Lock = {
  id: string
  title: string
  amount: string
}
type Props = StateProps & DispatchProps & OwnProps & ThemeProps

export const FioStakingOverviewSceneComponent = (props: Props) => {
  const {
    theme,
    route: {
      params: { currencyCode, walletId }
    },
    currencyWallet,
    stakingCryptoAmountFormat,
    stakingFiatBalanceFormat,
    currencyDenomination,
    refreshAllFioAddresses,
    fiatCurrencyCode,
    fiatSymbol
  } = props
  const styles = getStyles(theme)
  const [locks, setLocks] = React.useState<Lock[]>([])
  const stakingStatus = useWatch(currencyWallet, 'stakingStatus')

  React.useEffect(() => {
    refreshAllFioAddresses()
  }, [refreshAllFioAddresses])

  React.useEffect(() => {
    setLocks(
      stakingStatus.stakedAmounts
        .filter(({ unlockDate }) => unlockDate != null && new Date(unlockDate).getTime() >= new Date().getTime())
        .map(({ nativeAmount, unlockDate }) => ({
          // @ts-expect-error Flow does not understand that unlockDate here can't be undefined
          id: new Date(unlockDate).toDateString(),
          // @ts-expect-error Flow does not understand that unlockDate here can't be undefined
          title: sprintf(s.strings.staking_locked_title, formatTimeDate(new Date(unlockDate), true)),
          amount: formatNumber(add(convertNativeToDenomination(currencyDenomination.multiplier)(nativeAmount), '0'))
        }))
    )
  }, [stakingStatus, currencyDenomination])

  const handlePressStake = () => {
    Actions.jump('fioStakingChange', { change: 'add', currencyCode, walletId })
  }
  const handlePressUnstake = () => {
    Actions.jump('fioStakingChange', { change: 'remove', currencyCode, walletId })
  }

  const renderItems = () =>
    locks.map(item => {
      const amount = `${item.amount} ${currencyCode}`
      return (
        <Tile key={item.id} type="static" title={item.title}>
          <EdgeText>{amount}</EdgeText>
        </Tile>
      )
    })

  const staked = `${stakingCryptoAmountFormat} ${currencyCode}`
  const fiatStaked = ` (${fiatSymbol}${stakingFiatBalanceFormat} ${fiatCurrencyCode})`

  return (
    <SceneWrapper background="header" hasTabs={false}>
      <SceneHeader style={styles.sceneHeader} title={sprintf(s.strings.staking_overview_header, currencyCode)} underline withTopMargin>
        <Image style={styles.currencyLogo} source={fioLogo} />
      </SceneHeader>
      <ScrollView style={styles.scrollContainer}>
        <EdgeText style={styles.explainerText}>{s.strings.staking_overview_explainer}</EdgeText>
        <Tile type="static" title="Currently Staked">
          <EdgeText>
            {staked}
            <EdgeText style={styles.fiatAmount}>{fiatStaked}</EdgeText>
          </EdgeText>
        </Tile>
        {renderItems()}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <MainButton onPress={handlePressStake} type="secondary" label={s.strings.staking_stake_funds_button} />
        <ClickableText onPress={handlePressUnstake} label={s.strings.staking_unstake_funds_button} />
      </View>
    </SceneWrapper>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  currencyLogo: {
    height: theme.rem(1.25),
    width: theme.rem(1.25),
    resizeMode: 'contain',
    marginLeft: theme.rem(1)
  },
  scrollContainer: {
    flex: 1,
    marginVertical: theme.rem(0.5)
  },
  explainerText: {
    marginVertical: theme.rem(0.5),
    marginHorizontal: theme.rem(1)
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: theme.rem(0.5)
  },
  fiatAmount: {
    color: theme.secondaryText
  }
}))

export const FioStakingOverviewScene = connect<StateProps, DispatchProps, OwnProps>(
  (state, ownProps) => {
    const {
      route: {
        params: { walletId, currencyCode }
      }
    } = ownProps
    const currencyWallet = state.core.account.currencyWallets[walletId]
    const guiWallet = state.ui.wallets.byId[walletId]

    const stakingCurrencyCode = `${currencyCode}${STAKING_BALANCES.staked}`

    const currencyDenomination = getDisplayDenomination(state, currencyWallet.currencyInfo.pluginId, currencyCode)
    const stakingCryptoAmountFormat = formatNumber(
      add(convertNativeToDenomination(currencyDenomination.multiplier)(guiWallet.nativeBalances[stakingCurrencyCode] || '0'), '0')
    )

    const defaultDenomination = getExchangeDenomination(state, currencyWallet.currencyInfo.pluginId, currencyCode)
    const stakingDefaultCryptoAmount = convertNativeToDenomination(defaultDenomination.multiplier)(guiWallet.nativeBalances[stakingCurrencyCode] || '0')
    const stakingFiatBalance = convertCurrency(state, currencyCode, guiWallet.isoFiatCurrencyCode, stakingDefaultCryptoAmount)
    const stakingFiatBalanceFormat = formatNumber(stakingFiatBalance && gt(stakingFiatBalance, '0.000001') ? stakingFiatBalance : 0, { toFixed: 2 })

    return {
      currencyWallet,
      stakingCryptoAmountFormat,
      stakingFiatBalanceFormat,
      currencyDenomination,
      fiatCurrencyCode: guiWallet.fiatCurrencyCode,
      fiatSymbol: getSymbolFromCurrency(guiWallet.isoFiatCurrencyCode)
    }
  },
  dispatch => ({
    refreshAllFioAddresses() {
      dispatch(refreshAllFioAddresses())
    }
  })
)(withTheme(FioStakingOverviewSceneComponent))
