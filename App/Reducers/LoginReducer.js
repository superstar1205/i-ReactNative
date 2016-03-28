import Types from '../Actions/Types'
import Immutable from 'seamless-immutable'
import createReducer from './CreateReducer'

export const INITIAL_STATE = Immutable({
  username: null,
  errorCode: null,
  attempting: false
})

// login attempts
const attempt = (state, action) => {
  return { ...state, ...{ attempting: true } }
}

// successful logins
const success = (state, action) => {
  return { ...state, ...{ attempting: false, errorCode: null, username: action.username } }
}

// login failure
const failure = (state, action) => {
  return { ...state, ...{ attempting: false, errorCode: action.errorCode } }
}

// logout
const logout = (state, action) => {
  return { ...state, ...{ username: null } }
}

// map our types to our handlers
const ACTION_HANDLERS = {
  [Types.LOGIN_ATTEMPT]: attempt,
  [Types.LOGIN_SUCCESS]: success,
  [Types.LOGIN_FAILURE]: failure,
  [Types.LOGOUT]: logout
}

export default createReducer(INITIAL_STATE, ACTION_HANDLERS)
