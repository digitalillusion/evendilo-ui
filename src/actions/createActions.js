import {
  makeAction,
  AbstractActions
} from "gatsby-plugin-silverghost/lib/actions"

const definitions = {
  SESSION: makeAction("@@App/SESSION", "session"),
  IMPORTER: makeAction("@@App/IMPORTER", "importer", "/:family/:destination", {
    family: ["standard"],
    destination: [["amazon", "ebay", "woocommerce"]]
  })
}
export const Actions = AbstractActions.instance(definitions)
