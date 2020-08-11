import { Actions } from "../actions/createActions"
import { handleImport } from "./importService"
import { handleSession } from "./sessionService"
import { isEmpty } from "../functions"

export const BASE_PATH = `${process.env.GATSBY_API_URL}`

export function handleErrorsAndResponse(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response.json();
}

export const reduxService = store => next => action => {
  let matched = Actions.match(action)
  const state = store.getState();
  const authentication = state[Actions.SESSION.getReducerKey()]
  const isAuthenticated = !isEmpty(authentication) && !authentication.payload.anonymous

  switch (matched.type) {
    case Actions.SESSION.REQUEST:
      handleSession(store.dispatch, matched, next)
      break
    case Actions.IMPORTER.REQUEST:
      isAuthenticated && handleImport(state[Actions.IMPORTER.getReducerKey()], matched, next)
      break
    default:
  }

  return action
}
