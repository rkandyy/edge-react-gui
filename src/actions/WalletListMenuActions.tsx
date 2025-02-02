import Clipboard from '@react-native-clipboard/clipboard'
import * as React from 'react'
import { Linking } from 'react-native'
import { sprintf } from 'sprintf-js'

import { ButtonInfo, ButtonsModal } from '../components/modals/ButtonsModal'
import { RawTextModal } from '../components/modals/RawTextModal'
import { TextInputModal } from '../components/modals/TextInputModal'
import { Airship, showError, showToast } from '../components/services/AirshipInstance'
import { ModalMessage } from '../components/themed/ModalParts'
import s from '../locales/strings'
import { Dispatch, GetState } from '../types/reduxTypes'
import { NavigationProp } from '../types/routerTypes'
import { getCurrencyCode } from '../util/CurrencyInfoHelpers'
import { logActivity } from '../util/logger'
import { validatePassword } from './AccountActions'
import { showDeleteWalletModal } from './DeleteWalletModalActions'
import { showResyncWalletModal } from './ResyncWalletModalActions'
import { showSplitWalletModal } from './SplitWalletModalActions'

export type WalletListMenuKey =
  | 'rename'
  | 'delete'
  | 'resync'
  | 'exportWalletTransactions'
  | 'getSeed'
  | 'manageTokens'
  | 'viewXPub'
  | 'getRawKeys'
  | 'rawDelete'
  | string // for split keys like splitBCH, splitETH, etc.

export function walletListMenuAction(
  navigation: NavigationProp<'walletList'> | NavigationProp<'transactionList'>,
  walletId: string,
  option: WalletListMenuKey,
  tokenId?: string
) {
  const switchString = option.startsWith('split') ? 'split' : option

  switch (switchString) {
    case 'manageTokens': {
      return (dispatch: Dispatch, getState: GetState) => {
        navigation.navigate('manageTokens', {
          walletId
        })
      }
    }

    case 'rawDelete': {
      return async (dispatch: Dispatch, getState: GetState) => {
        const state = getState()
        const { account } = state.core
        account.changeWalletStates({ [walletId]: { deleted: true } }).catch(showError)
      }
    }
    case 'delete': {
      return async (dispatch: Dispatch, getState: GetState) => {
        const state = getState()
        const wallets = state.ui.wallets.byId
        const wallet = wallets[walletId]

        if (Object.values(wallets).length === 1) {
          Airship.show(bridge => (
            <ButtonsModal bridge={bridge} buttons={{}} closeArrow title={s.strings.cannot_delete_last_wallet_modal_title}>
              <ModalMessage>{s.strings.cannot_delete_last_wallet_modal_message_part_1}</ModalMessage>
              <ModalMessage>{s.strings.cannot_delete_last_wallet_modal_message_part_2}</ModalMessage>
            </ButtonsModal>
          ))
          return
        }

        const type = wallet.type.replace('wallet:', '')
        let fioAddress = ''

        if (type === 'fio') {
          const engine = state.core.account.currencyWallets[walletId]
          if (engine != null) {
            try {
              const fioAddresses = await engine.otherMethods.getFioAddressNames()
              fioAddress = fioAddresses.length ? fioAddresses[0] : ''
            } catch (e: any) {
              fioAddress = ''
            }
          }
        }

        // If we are in the tx list scene, go back to the wallet list so we don't crash on a deleted wallet
        // Otherwise, goBack() does nothing if already in Wallet List
        navigation.goBack()
        if (fioAddress) {
          dispatch(showDeleteWalletModal(walletId, s.strings.fragmet_wallets_delete_fio_extra_message_mobile))
        } else if (wallet.currencyCode && wallet.currencyCode.toLowerCase() === 'eth') {
          dispatch(showDeleteWalletModal(walletId, s.strings.fragmet_wallets_delete_eth_extra_message))
        } else {
          dispatch(showDeleteWalletModal(walletId))
        }
      }
    }

    case 'resync': {
      return (dispatch: Dispatch) => {
        dispatch(showResyncWalletModal(walletId))
      }
    }

    case 'split': {
      return async (dispatch: Dispatch) => {
        dispatch(showSplitWalletModal(walletId, option.replace('split', '')))
      }
    }

    case 'viewXPub': {
      return (dispatch: Dispatch, getState: GetState) => {
        const state = getState()
        const { currencyWallets } = state.core.account
        const { displayPublicSeed, currencyInfo } = currencyWallets[walletId]
        const { xpubExplorer } = currencyInfo

        const copy: ButtonInfo = {
          label: s.strings.fragment_request_copy_title,
          type: 'secondary'
        }
        const link: ButtonInfo = {
          label: s.strings.transaction_details_show_advanced_block_explorer,
          type: 'secondary'
        }
        Airship.show(bridge => (
          <ButtonsModal
            // @ts-expect-error
            bridge={bridge}
            buttons={xpubExplorer != null ? { copy, link } : { copy }}
            closeArrow
            message={displayPublicSeed ?? ''}
            title={s.strings.fragment_wallets_view_xpub}
          />
          // @ts-expect-error
        )).then((result: 'copy' | 'link' | undefined) => {
          switch (result) {
            case 'copy':
              // @ts-expect-error
              Clipboard.setString(displayPublicSeed)
              showToast(s.strings.fragment_wallets_pubkey_copied_title)
              break
            case 'link':
              // @ts-expect-error
              if (xpubExplorer != null) Linking.openURL(sprintf(currencyInfo.xpubExplorer, displayPublicSeed))
          }
        })
      }
    }

    case 'exportWalletTransactions': {
      return async (dispatch: Dispatch, getState: GetState) => {
        const state = getState()
        const { currencyWallets } = state.core.account
        const wallet = currencyWallets[walletId]
        navigation.navigate('transactionsExport', {
          sourceWallet: wallet,
          currencyCode: getCurrencyCode(wallet, tokenId)
        })
      }
    }

    case 'getSeed': {
      return async (dispatch: Dispatch, getState: GetState) => {
        const state = getState()
        const { account } = state.core
        const { currencyWallets } = account
        const wallet = currencyWallets[walletId]

        const passwordValid = await dispatch(
          validatePassword({
            title: s.strings.fragment_wallets_get_seed_title,
            submitLabel: s.strings.fragment_wallets_get_seed_wallet,
            warningMessage: s.strings.fragment_wallets_get_seed_warning_message
          })
        )

        if (passwordValid) {
          const { name, id, type } = wallet
          logActivity(`Show Master Private Key: ${account.username} -- ${name ?? ''} -- ${type} -- ${id}`)
          // Add a copy button only for development
          let devButtons = {}
          // @ts-expect-error
          if (global.__DEV__) devButtons = { copy: { label: s.strings.fragment_wallets_copy_seed } }

          await Airship.show<'copy' | 'ok' | undefined>(bridge => (
            <ButtonsModal
              title={s.strings.fragment_wallets_get_seed_wallet}
              bridge={bridge}
              message={wallet.displayPrivateSeed ?? ''}
              buttons={{ ok: { label: s.strings.string_ok_cap }, ...devButtons }}
            />
          )).then(buttonPressed => {
            // @ts-expect-error
            if (global.__DEV__ && buttonPressed === 'copy') {
              // @ts-expect-error
              Clipboard.setString(wallet.displayPrivateSeed)
              showToast(s.strings.fragment_wallets_copied_seed)
            }
          })
        }
      }
    }

    case 'getRawKeys': {
      return async (dispatch: Dispatch, getState: GetState) => {
        const passwordValid = await dispatch(
          validatePassword({
            title: s.strings.fragment_wallets_get_raw_keys_title,
            warningMessage: s.strings.fragment_wallets_get_raw_keys_warning_message,
            submitLabel: s.strings.string_get_raw_keys
          })
        )
        if (passwordValid) {
          const state = getState()
          const { account } = state.core

          const keys = account.allKeys.find(key => key.id === walletId)
          const seed = keys ? JSON.stringify(keys.keys, null, 2) : ''
          Airship.show(bridge => <RawTextModal bridge={bridge} body={seed} title={s.strings.string_raw_keys} disableCopy />)
        }
      }
    }

    case 'rename': {
      return async (dispatch: Dispatch, getState: GetState) => {
        const state = getState()
        const { currencyWallets } = state.core.account
        const wallet = currencyWallets[walletId]
        const walletName = wallet.name ?? ''

        await Airship.show<string | undefined>(bridge => (
          <TextInputModal
            autoCorrect={false}
            bridge={bridge}
            initialValue={walletName}
            inputLabel={s.strings.fragment_wallets_rename_wallet}
            returnKeyType="go"
            title={s.strings.fragment_wallets_rename_wallet}
            onSubmit={async name => {
              await wallet.renameWallet(name)
              dispatch({
                type: 'UI/WALLETS/UPSERT_WALLETS',
                data: { wallets: [wallet] }
              })
              return true
            }}
          />
        ))
      }
    }

    default:
      return (dispatch: Dispatch) => undefined
  }
}
