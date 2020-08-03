import React from "react"
import IntlProvider from "react-intl/lib/src/components/provider"

const i18nMessages = {
  "import.upload.enrichment_file" : "File d'arricchimento",

  'tpl.upload.filename' : 'Uploading file {0}',
  'tpl.upload.empty' : 'No messages to display',
  'tpl.enhancedTable.filterResults': 'Filter results',
  'tpl.enhancedTable.filter': 'Filter',
  'tpl.enhancedTable.cancel': 'Cancel',
  'tpl.enhancedDialog.placeholder' : 'Enter a {0}',
  'tpl.upload.upload' : 'Upload'
}


export default function Layout({ children }) {
  return (
    <IntlProvider key={ 'en' } locale={ 'en' }  messages={ i18nMessages }>
      {children}
    </IntlProvider>
  )
}