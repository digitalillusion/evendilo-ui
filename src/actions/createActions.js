import {
  makeAction,
  AbstractActions
} from "gatsby-plugin-silverghost/lib/actions"

const definitions = {
  IMPORTER: makeAction("@@App/IMPORTER", "importer", "/:destination", {
    destination: ["woocommerce"]
  })
}
export const Actions = AbstractActions.instance(definitions)
