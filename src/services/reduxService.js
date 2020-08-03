import { Actions } from "../actions/createActions"
import { handleImport } from "./importService"

export const BASE_PATH = `${process.env.GATSBY_API_URL}`

export const reduxService = store => next => action => {
  let matched = Actions.match(action)
  const state = store.getState();

  switch (matched.type) {
    case Actions.IMPORTER.REQUEST:
      handleImport(state[Actions.IMPORTER.getReducerKey()], matched, next)
      break
    default:
  }

  return action
}
