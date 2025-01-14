import { describe, expect, it } from '@jest/globals'
import * as React from 'react'
import { createRenderer } from 'react-test-renderer/shallow'

import { FioDomainRegister } from '../../components/scenes/FioDomainRegisterScene'
import { getTheme } from '../../components/services/ThemeContext'

describe('FioDomainRegister', () => {
  it('should render with loading props', () => {
    const renderer = createRenderer()

    const props: any = {
      navigation: undefined,
      fioWallets: [
        {
          fiatCurrencyCode: 'iso:USD',
          addCustomToken: 'shib',
          currencyInfo: {
            currencyCode: 'SHIB'
          }
        }
      ],
      fioPlugin: {
        currencyInfo: 'FIO plugin'
      },
      isConnected: true,
      createFioWallet: async () => ({
        fiatCurrencyCode: 'iso:USD',
        addCustomToken: 'shib',
        currencyInfo: {
          currencyCode: 'SHIB'
        }
      }),
      theme: getTheme()
    }
    const actual = renderer.render(<FioDomainRegister {...props} />)

    expect(actual).toMatchSnapshot()
  })
})
