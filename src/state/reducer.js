import { Actions } from "../actions/createActions"
import { combineReducers } from "redux"
import {
  accumulate,
  DefaultReducer
} from "gatsby-plugin-silverghost/lib/reducers"

const initialState = {}

const rootReducer = combineReducers({
  [Actions.SESSION.getReducerKey()]: DefaultReducer.instance(initialState, Actions.SESSION),
  [Actions.IMPORTER.getReducerKey()]: accumulate(
    DefaultReducer.instance(initialState, Actions.IMPORTER)
  )
})

export default rootReducer
