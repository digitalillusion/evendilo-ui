import React from "react"
import TplUploadFile from "../components/templates/tplUploadFile"
import { NavigationBuilder } from "gatsby-plugin-silverghost/lib/components/NavigationBuilder"
import { globalHistory } from "@reach/router"
import { useSelector, useStore } from "react-redux"
import { makeStyles } from "@material-ui/styles"
import { Actions } from "../actions/createActions"
import { isEmpty, t } from "../functions"
import TplLoading from "../components/templates/tplLoading"

import { styles } from "../styles/importer"
import Layout from "../components/layout"
import { BASE_PATH } from "../services/reduxService"
import Button from "@material-ui/core/Button"

const useStyles = makeStyles(styles)

export default function Home() {
  const store = useStore()
  const classes = useStyles()

  const importer = useSelector(state => state.importer, [])
  if (isEmpty(importer)) {
    return <Layout><TplLoading/></Layout>
  }

  const [family, destination] = importer.params
  const upload = importer.payload[family][destination]

  const navigation = new NavigationBuilder(store, globalHistory)
    .withEvent(Actions.IMPORTER, { mapper: (action, input) => {
      switch (input.target.event) {
        case "upload" :
          action.params = [input.target.entity.family, input.target.entity.destination, input.target]
          break
        default:
          action.params = [family, destination, input.target]
      }
      return action
    }})
    .build();

  let results = upload.results
  let lastResult = (results && results.length > 0) ? results.sort((r1,r2) => r2.index - r1.index)[0] : undefined

  const entries = upload.categories
    .map(c => {
    const parts = c.replace(/([a-z])([A-Z])/g, '$1 $2').split(" ");
    const entityKey = {
      family: parts[0].toLowerCase(),
      destination: parts[1].toLowerCase(),
      name: c
    }
    upload.importTags.forEach(t => c.replace(t, ""))
    const entityLabel = t('importer.upload.entity.' + c)
    return { key: entityKey, value: entityLabel }
  })
  .filter(e => e.key.family === family && e.key.destination === destination)
  return (
    <Layout>
      <TplUploadFile
        htmlId="import"
        classes={classes}
        fileMimeTypes={'.*'}
        uploadOnClick={target => navigation.onEvent(Actions.IMPORTER)({ event: "upload", entity: target.entity, file: target.value })}
        uploadProgress={lastResult ? 100 * (lastResult.index + 1) / lastResult.count : 0}
        uploadResultListEntries={results}
        uploadStarted={upload.started}
        uploadCompleted={upload.completed}
        uploadSubscriberUrl={`/topic/import/${family}/${destination}`}
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
      {upload.completed && <Button onClick={target => navigation.onEvent(Actions.IMPORTER)({ event: "restart", target })} variant="contained">{ t("importer.upload.restart") }</Button>}
    </Layout>
  )
}
