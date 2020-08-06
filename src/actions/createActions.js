import {
  makeAction,
  AbstractActions
} from "gatsby-plugin-silverghost/lib/actions"

const definitions = {
  SESSION: makeAction("@@App/SESSION", "session"),
  IMPORTER: makeAction("@@App/IMPORTER", "importer", "/:destination", {
    destination: ["woocommerce"]
  })
}
export const Actions = AbstractActions.instance(definitions)
