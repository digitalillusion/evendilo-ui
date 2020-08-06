import React from "react"
import TplUploadFile from "../components/templates/tplUploadFile"
import { NavigationBuilder } from "gatsby-plugin-silverghost/lib/components/NavigationBuilder"
import { globalHistory } from "@reach/router"
import { useSelector, useStore } from "react-redux"
import { makeStyles } from "@material-ui/styles"
import { Actions } from "../actions/createActions"
import { isEmpty } from "../functions"
import TplLoading from "../components/templates/tplLoading"

import { styles } from "../styles/import"
import Layout from "../components/layout"
import { BASE_PATH } from "../services/reduxService"

const useStyles = makeStyles(styles)

export default function Home() {
  const store = useStore()
  const classes = useStyles()

  const importer = useSelector(state => state.importer, [])
  if (isEmpty(importer)) {
    return <Layout><TplLoading/></Layout>
  }

  const [destination] = importer.params
  const upload = importer.payload[destination]

  const navigation = new NavigationBuilder(store, globalHistory)
    .withEvent(Actions.IMPORTER, { mapper: (action, input) => action.params = [destination, input.target], ajax: true })
    .build();

  let results = upload.results
  let lastResult = (results && results.length > 0) ? results.sort((r1,r2) => r2.index - r1.index)[0] : undefined

  const entries = upload.categories.map(c => {
    const entityName = c.substr(upload.importTags.reduce((acc, tag) => acc + tag.type.length, 0))
    return { key: entityName, value: entityName }
  })
  return (
    <Layout>
      <TplUploadFile
        classes={classes}
        fileMimeTypes={'.*'}
        uploadOnClick={target => navigation.onEvent(Actions.IMPORTER)({ event: "upload", target })}
        uploadProgress={lastResult ? 100 * (lastResult.index + 1) / lastResult.count : 0}
        uploadResultListEntries={results}
        uploadStarted={upload.started}
        uploadCompleted={upload.completed}
        uploadSubscriberUrl={`/topic/import/standard/${destination}`}
        websocket={`${BASE_PATH}/messages`}
        websocketHeaders={{}}
        callback={payload => navigation.onEvent(Actions.IMPORTER)({ event: "refresh", target: payload })}
        uploadResultListEntryProperties={[
          { 'id' : 'severity', 'label' : 'Severity', width: 150 },
          { 'id' : 'group', 'label' : 'Group', width: 150 },
          { 'id' : 'indexInGroup', 'label' : 'Line', width: 150 },
          { 'id' : 'message', 'label' : 'Message', width : 800 }
        ]}
        uploadResultListEntrySort={['indexInGroup', 'desc']}
        selectEntries={entries}
        defaultSelectEntry={entries[0]}
      />
    </Layout>
  )
}
