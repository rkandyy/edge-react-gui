import { describe, expect, it } from '@jest/globals'
import * as React from 'react'
import { createRenderer } from 'react-test-renderer/shallow'

import { FioAddressRegistered } from '../../components/scenes/FioAddressRegisteredScene'
import { getTheme } from '../../components/services/ThemeContext'

describe('FioAddressRegistered', () => {
  it('should render with loading props', () => {
    const renderer = createRenderer()

    const props: any = {
      state: {
        contacts: [
          {
            hasThumbnail: true,
            emailAddresses: ['myemail@yahoo'],
            postalAddresses: ['123 Home St.'],
            middleName: 'John',
            company: 'Edge',
            jobTitle: 'Boss',
            familyName: 'Savage',
            thumbnailPath: 'Fio.png',
            recordID: '123',
            givenName: 'John Wick'
          }
        ],
        deviceReferral: {
          messages: [
            {
              message: 'Refferal',
              uri: `%BTC`,
              iconUri: `%BTC`,
              startDate: '',
              durationDays: 11
            }
          ],
          plugins: ['PluginTweaks']
        },
        exchangeRates: ['USD/FIO'],
        nextUsername: 'string',
        pendingDeepLink: {
          type: 'other',
          protocol: 'FIO',
          uri: `%BTC`
        },
        account: {
          accountReferral: {
            promotions: ['promotion'],
            ignoreAccountSwap: true,
            hiddenAccountMessages: [false]
          },
          accountReferralLoaded: true,
          referralCache: {
            accountMessages: [],
            accountPlugins: []
          }
        },

        network: {
          isConnected: true
        }
      },
      wallets: [
        {
          id: '0x34653463',
          type: 'FIO wallet',
          name: 'MyFio',
          primaryNativeBalance: '1',
          nativeBalances: ['FIO'],
          currencyNames: ['FIO'],
          currencyCode: 'FIO',
          isoFiatCurrencyCode: 'iso: USD',
          fiatCurrencyCode: 'USD',
          symbolImage: 'fio logo',
          symbolImageDarkMono: 'Fio image',
          metaTokens: [
            {
              currencyCode: 'FIO',
              currencyName: 'Fio',
              denominations: [
                {
                  multiplier: '10000000',
                  name: 'FIO'
                }
              ]
            }
          ],
          enabledTokens: ['FIO'],
          receiveAddress: {
            publicAddress: '0x434dsfv455'
          },
          blockHeight: 35
        }
      ],
      fioWallets: ['walletId'],
      fioDisplayDenomination: {
        multiplier: '100000000',
        name: 'FIO'
      },
      isConnected: true,
      route: {
        params: {
          fioAddress: '0x34263463',
          selectedWallet: 'walletId',
          selectedDomain: 'MyFio@edge'
        }
      },
      // @ts-expect-error
      onSelectWallet: (walletId, currencyCode) => undefined,
      theme: getTheme()
    }
    const actual = renderer.render(<FioAddressRegistered {...props} />)

    expect(actual).toMatchSnapshot()
  })
})
