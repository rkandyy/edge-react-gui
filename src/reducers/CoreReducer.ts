import { Disklet } from 'disklet'
import { EdgeAccount, EdgeContext } from 'edge-core-js/types'
import { combineReducers, Reducer } from 'redux'

import { Action } from '../types/reduxTypes'
import { edgeLogin, EdgeLoginState } from './EdgeLoginReducer'

export type CoreState = {
  readonly account: EdgeAccount
  readonly context: EdgeContext
  readonly disklet: Disklet
  readonly otpErrorShown: boolean

  // Nested reducers:
  readonly edgeLogin: EdgeLoginState
}

const flowHack: any = {}
const defaultContext: EdgeContext = flowHack
const defaultDisklet: Disklet = flowHack

const accountHack: any = {
  activeWalletIds: [],
  currencyConfig: {},
  currencyWallets: {}
}
const defaultAccount: EdgeAccount = accountHack

export const core: Reducer<CoreState, Action> = combineReducers({
  account(state: EdgeAccount = defaultAccount, action: Action): EdgeAccount {
    switch (action.type) {
      case 'LOGIN':
        return action.data.account
      case 'LOGOUT':
        return defaultAccount
    }
    return state
  },

  context(state: EdgeContext = defaultContext, action: Action): EdgeContext {
    return action.type === 'CORE/CONTEXT/ADD_CONTEXT' ? action.data.context : state
  },

  disklet(state: Disklet = defaultDisklet, action: Action): Disklet {
    return action.type === 'CORE/CONTEXT/ADD_CONTEXT' ? action.data.disklet : state
  },

  otpErrorShown(state: boolean = false, action: Action): boolean {
    switch (action.type) {
      case 'OTP_ERROR_SHOWN':
        return true
      case 'LOGOUT':
        return false
    }
    return state
  },

  // Nested reducers:
  edgeLogin
})
