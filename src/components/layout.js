import React, { useEffect } from "react"
import IntlProvider from "react-intl/lib/src/components/provider"
import { useSelector, useStore } from "react-redux"
import { NavigationBuilder } from "gatsby-plugin-silverghost/lib/components/NavigationBuilder"
import { globalHistory } from "@reach/router"
import { isEmpty, t } from "../functions"
import { Actions } from "../actions/createActions"
import Button from "@material-ui/core/Button"
import { Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/styles"
import { styles } from "../styles/importer"

const useStyles = makeStyles(styles)

//if (typeof window !== "undefined" && window.document) {
//  document.domain = `${process.env.GATSBY_DOCUMENT_DOMAIN}`
//}

const i18nMessages = {
  "importer.upload.restart" : "Restart",
  "importer.upload.entity.StandardAmazonProduct" : "Amazon",
  "importer.upload.entity.StandardEbayProduct" : "ebay",
  "importer.upload.entity.StandardWoocommerceProduct" : "WooCommerce",

  'tpl.upload.filename' : 'Uploading file {0}',
  'tpl.upload.completed' : 'Upload completed',
  'tpl.upload.empty' : 'No messages to display',
  'tpl.enhancedTable.filterResults': 'Filter results',
  'tpl.enhancedTable.filter': 'Filter',
  'tpl.enhancedTable.cancel': 'Cancel',
  'tpl.enhancedDialog.placeholder' : 'Enter a {0}',
  'tpl.upload.upload' : 'Upload',

  'session.login.woocommerce' : 'WooCommerce Login',
  'session.login.ebay' : 'eBay Login',
  'session.loggedAs' : ' Logged as {0} on {1} ({2})',
  'session.logout' : 'Logout'
}

function SessionButton({ onClick, label }) {
  return <Button onClick={onClick} variant="contained">{ label }</Button>
}

function Anonymous({ navigation }) {
  return <div>
    <SessionButton onClick={_ => navigation.onEvent(Actions.SESSION)({ event: "login", destination: "ebay" }) } label={t('session.login.ebay')} />
    <SessionButton onClick={_ => navigation.onEvent(Actions.SESSION)({ event: "login", destination: "woocommerce" }) } label={t('session.login.woocommerce')} />
  </div>
}

function Authenticated({classes, session, navigation, children}) {
  return <div>
    <p>
      <SessionButton onClick={_ => navigation.onEvent(Actions.SESSION)({ event: "logout" }) } label={t('session.logout')} />
      <Typography className={classes.loggedAs}>{t('session.loggedAs', session.authentication.name, session.authentication.destination, session.authentication.clientId)}</Typography>

    </p>
    {children}
  </div>
}

export default function Layout({ children }) {
  const store = useStore()
  const classes = useStyles()
  const session = useSelector(state => state.session, []).payload
  const isAnonymous = isEmpty(session) || session.anonymous

  const navigation = new NavigationBuilder(store, globalHistory)
    .withEvent(Actions.SESSION, { mapper: (action, input) => action.params = [input.target] })
    .withEvent(Actions.IMPORTER, { mapper: (action, input) => action.params = [input.target.family, input.target.destination] })
    .build();

  useEffect(() => {
    if(isEmpty(session)) {
      navigation.onEvent(Actions.SESSION)({ event: "whois" })
    } else if (!session.anonymous) {
      navigation.onEvent(Actions.IMPORTER)({ family: "standard", destination: session.authentication.destination })
    }
  }, [isAnonymous])

  return (
    <IntlProvider key={ 'en' } locale={ 'en' }  messages={ i18nMessages }>
      { isAnonymous ? <Anonymous navigation={navigation} /> : <Authenticated  classes={classes} session={session} navigation={navigation}>{children}</Authenticated> }
    </IntlProvider>
  )
}