import { describe, expect, it } from '@jest/globals'
import * as React from 'react'
import { createRenderer } from 'react-test-renderer/shallow'

import { CreateWalletReviewComponent } from '../../components/scenes/CreateWalletReviewScene'
import { getTheme } from '../../components/services/ThemeContext'
import { fakeNavigation } from '../../util/fake/fakeNavigation'

describe('CreateWalletReviewComponent', () => {
  it('should render with loading props', () => {
    const renderer = createRenderer()

    const props: any = {
      navigation: fakeNavigation,
      route: {
        name: 'createWalletReview',
        params: {
          cleanedPrivateKey: 'bitcoinbitcoinbitcoin',
          selectedWalletType: {
            currencyName: 'bitcoin',
            walletType: 'wallet:bitcoin',
            symbolImage: 'BTC',
            currencyCode: 'BTC'
          },
          selectedFiat: {
            label: 'USD',
            value: 'USD'
          },
          walletName: 'my bitcoin wallet'
        }
      },
      // @ts-expect-error
      createCurrencyWallet: async (walletName, walletType, fiatCurrencyCode, cleanedPrivateKey) => undefined,
      theme: getTheme()
    }
    const actual = renderer.render(<CreateWalletReviewComponent {...props} />)

    expect(actual).toMatchSnapshot()
  })
})
