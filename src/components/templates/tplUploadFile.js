import React from 'react';
import loadable from '@loadable/component';

import FileUpload from '@material-ui/icons/Publish';
import {
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Typography
} from '@material-ui/core'

import WebsocketListener from "../websocketListener"
import { isEmpty, t } from "../../functions"
import injectIntl from "react-intl/lib/src/components/injectIntl"
import TplLoading from "./tplLoading"
const TplEnhancedTable = loadable(() => import("./tplEnhancedTable"));


const DefaultUploadButton = (props) => {
  return <Button variant="contained" color="default"
                 {... (props.disabled ? {disabled : true} : {} ) }
                 onClick={props.onClick}>
    {props.label}
    {props.icon}
  </Button>
}


class TplUploadFile extends React.Component {
  static defaultProps = {
    fileMimeTypes : '*.*'
  }


  constructor(props) {
    super(props)

    this.state = {
      wsConnected: false,
      entityName: props.defaultSelectEntry ? props.defaultSelectEntry : '',
      file: {},
    }

    this.classes = {
      formControl: ''
    }

    this.selectEmptyMessageProducer = () => 'This section is empty.'
    this.selectOnChange = () => {}
    this.inputRef = React.createRef()
    this.uploadResultListEntries = props.uploadResultListEntries
    this.lastRcvTimestamp = 0
    this.websocketListener = WebsocketListener.instance(this.props.websocket)
  }

  websocketCallback = (frame) => {
    let packet = JSON.parse(frame.body)

    if (packet.timestamp - this.lastRcvTimestamp > 1000 && packet.linesSent <= packet.results.length && this.uploadResultListEntries.length > 0) {
      this.uploadResultListEntries = []
    }
    this.lastRcvTimestamp = packet.timestamp
    this.linesSent = packet.linesSent
    for (let result of packet.results) {
      this.uploadResultListEntries.push(result)
    }
    packet.results = this.uploadResultListEntries
    setTimeout(() => this.props.callback(packet), 100)
  }

  componentDidMount() {
    this.websocketListener.register([
      { route: this.props.uploadSubscriberUrl, callback: this.websocketCallback }
    ], this.props.websocketHeaders, this.props.websocketSubscriptionId, () => this.setState({ wsConnected : true }))
  }

  componentWillUnmount() {
    this.websocketListener.unregister([
      { route: this.props.uploadSubscriberUrl }
    ])
  }

  isUploadInProgress() {
    return this.props.uploadStarted && !this.props.uploadCompleted
  }

  render() {
    const { classes, htmlId, selectLabel, uploadOnClick, uploadFilename, uploadProgress, uploadResultListEntries, uploadResultListEntryFilter = {}, uploadResultListEntrySort = ['', null], uploadResultListEntryProperties, uploadResultListEntryMapper, selectEntries = [], defaultSelectEntry, fileMimeTypes, buttonComponent = DefaultUploadButton, intl } = this.props
    let scope = this

    if (!scope.state.wsConnected) {
      return <TplLoading />
    }

    function showUploadForm() {
      if (scope.isUploadInProgress() || selectEntries.length === 0 || uploadResultListEntries.length > 0) {
        return null
      }

      const hasSelect = isEmpty(defaultSelectEntry) || selectEntries.length !== 1

      const getUploadFileState = () => ({
        value : scope.state.file,
        entityName : scope.state.entityName
      });
      return (<span>
                <FormControl className={classes.formControl} style={{ display: hasSelect ? "inline-flex" : "none", verticalAlign: "bottom" }}>
                    {hasSelect &&
                    <InputLabel htmlFor="age-simple">{selectLabel}</InputLabel>}
                  {hasSelect &&
                  <Select
                    value={ scope.state.entityName}
                    inputProps={{
                      id: htmlId + '-select',
                      name: htmlId + '-select'
                    }}
                    onChange={event => {
                      let target = event.target
                      let callback = scope.selectOnChange
                      scope.setState({entityName: target.value}, () => {
                        callback(target)
                      })
                    }}>
                    {selectEntries.map((entry, index) => <MenuItem key={index} value={entry.key}>{entry.value}</MenuItem>)}
                  </Select>}
                  <input id={htmlId + '-upload-hidden'}
                         type="file"
                         accept={fileMimeTypes}
                         style={{ display: 'none' }} ref={scope.inputRef}
                         onChange={event => {
                           scope.lastRcvTimestamp = new Date().getMilliseconds()
                           scope.setState({file: event.target.files[0]}, () => {
                             uploadOnClick(getUploadFileState())
                             scope.inputRef.current.value = null
                           })
                         }} />
                </FormControl>
                {buttonComponent({
                  label:  t('tpl.upload.upload'),
                  icon : <FileUpload />,
                  disabled : scope.state.entityName === '',
                  onClick: () => scope.inputRef.current.click(),
                  getUploadFileState: getUploadFileState
                })}
            </span>)
    }

    function showUploadProgress() {
      if (!scope.isUploadInProgress() && uploadResultListEntries.length === 0) {
        return null
      }
      return (<div className={classes.progress}>
        <Typography variant={"caption"}>{intl.formatMessage({ id : 'tpl.upload.filename' }, { '0' : scope.state.file.name || uploadFilename })}</Typography>
        <LinearProgress { ...(uploadProgress === 0 || uploadProgress === Infinity  ?
            { variant : 'indeterminate' }  :
            { variant : 'determinate', value : uploadProgress}
        )} />
        <TplEnhancedTable headers={uploadResultListEntryProperties} rows={uploadResultListEntries} />
      </div>)
    }

    function showEmptyMessage() {
      if (!scope.isUploadInProgress() && selectEntries.length === 0) {
        return scope.selectEmptyMessageProducer()
      }
    }

    return showUploadForm() || showUploadProgress() || showEmptyMessage()
  }
}

export default injectIntl(TplUploadFile);
