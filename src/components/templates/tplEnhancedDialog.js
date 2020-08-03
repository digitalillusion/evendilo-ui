import React from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';
import { injectIntl } from "react-intl";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField,
  FormControl, FormControlLabel, FormLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox
} from '@material-ui/core';

export const TplSearchBar = loadable(() => import ('./tplSearchBar'));
export const TplActionButton = loadable(() => import ('./tplActionButton'));


const EnhancedDialogContent = injectIntl(({ headers, values, changeValue, forbiddenValues, validationMessages, intl}) => {
  let selectedValues;

  function getSelectValue(h) {
    return h.values.filter(entry => values[h.id] === entry.key);
  }

  function getSelectValues(h) {
    return h.values.filter(entry => {
      if (Array.isArray(values[h.id])) {
        return values[h.id].includes(entry.key);
      }
      return values[h.id] === entry.key;
    });
  }

  return (
    <DialogContent>
      {headers.map((h, index) => {
        let hasError = (validationMessages[h.id] ? {error : true} : {});
        let hasAdditionalProps = h.computedProps ? h.computedProps(values) : null || {};
        let isoString = values[h.id] && values[h.id].toISOString ? values[h.id].toISOString() : "";
        const placeholder = intl.formatMessage({ id: 'tpl.enhancedDialog.placeholder' }, { 0 : (typeof h.label === "string" ? h.label : intl.formatMessage(h.label.props)) });

        switch (h.type) {
          case 'search' :
          case 'searchMultiple' :
            selectedValues = h.type === 'searchMultiple' ? getSelectValues(h) : getSelectValue(h)
            return <FormControl fullWidth={true} key={index} {...hasError} {...hasAdditionalProps}>
              <TplSearchBar selectProps={{isMulti: h.type === 'searchMultiple', isCancellable: true, textFieldProps :{
                label: validationMessages[h.id] ? validationMessages[h.id] : h.label,
                InputLabelProps: {
                    shrink: true,
                },
              }}}
              input={{ value : selectedValues[0] ? selectedValues[0].key : null, onChange : changedValue => changeValue(h.id, changedValue) }}>
                {h.values.map(v => <MenuItem value={v.key}>{v.value}</MenuItem>)}
              </TplSearchBar>
            </FormControl>
          case 'multiple' :
            selectedValues = getSelectValues(h)
            return <FormControl fullWidth={true} key={index} {...hasError} {...hasAdditionalProps}>
              <InputLabel>{validationMessages[h.id] ? validationMessages[h.id] : h.label}</InputLabel>
              <Select
                id={h.id}
                multiple
                renderValue={values => {
                  let renderValues = values.map(v => selectedValues.filter(sv => sv.key === v)[0].value);
                  return renderValues.join(", ");
                }}
                value={selectedValues.map(selectedValue => selectedValue.key)}
                onChange={e => changeValue(h.id, e.target.value)}
              >
                {h.values.filter(entry => !forbiddenValues[h.id] || !forbiddenValues[h.id].includes(entry.key)).map((entry, entryIndex) => (
                  <MenuItem key={entryIndex} id={entry.id} value={entry.key}>{entry.value}</MenuItem>
                ))}
              </Select>
            </FormControl>;
          case 'enum' :
            selectedValues = getSelectValue(h)
            return <FormControl fullWidth={true} key={index} {...hasError} {...hasAdditionalProps}>
              <InputLabel>{validationMessages[h.id] ? validationMessages[h.id] : h.label}</InputLabel>
              <Select
                id={h.id}
                value={selectedValues[0] ? selectedValues[0].key : ""}
                onChange={(e, target) => changeValue(h.id, target.props.value)}>
                >
                {h.values.filter(entry => !forbiddenValues[h.id] || !forbiddenValues[h.id].includes(entry.key)).map((entry, entryIndex) => (
                  <MenuItem key={entryIndex} id={entry.id} value={entry.key}>{entry.value}</MenuItem>
                ))}
              </Select>
            </FormControl>;
          case 'number':
            return <TextField key={index}
                              fullWidth={true}
                              defaultValue={values[h.id]}
                              placeholder={placeholder}
                              label={validationMessages[h.id] ? validationMessages[h.id] : h.label}
                              type={h.type}
                              id={h.id}
                              onChange={e => changeValue(h.id, e.target.value)}
                              {...hasError}
                              {...hasAdditionalProps}
            />;
          case 'boolean':
            return <FormControlLabel key={index}
              control={<Checkbox checked={values[h.id]}
                                 onChange={e => {
                                   changeValue(h.id, e.target.checked);
                                 }}
                                 id={h.id}
                                 {...hasError}
                                 {...hasAdditionalProps}
              />}
              label={validationMessages[h.id] ? validationMessages[h.id] : h.label}
            />;
          case 'date':
            return <FormControl fullWidth={true} key={index} {...hasError} {...hasAdditionalProps}>
              <FormLabel>{validationMessages[h.id] ? validationMessages[h.id] : h.label}</FormLabel>
              <TextField
                type={h.type}
                key={index}
                id={h.id}
                fullWidth={true}
                defaultValue={isoString.slice(0,10)}
                placeholder={placeholder}
                onChange={e =>  changeValue(h.id, e.target.valueAsDate)}
                {...hasError}
                {...hasAdditionalProps}
              />
            </FormControl>;
          default:
            return <TextField
                              type={h.type || "text"}
                              key={index}
                              id={h.id}
                              fullWidth={true}
                              defaultValue={values[h.id]}
                              placeholder={placeholder}
                              label={validationMessages[h.id] ? validationMessages[h.id] : h.label}
                              onChange={e => changeValue(h.id, e.target.value)}
                              {...hasError}
                              {...hasAdditionalProps}
            />;
        }
      })}
    </DialogContent>
  );
});

EnhancedDialogContent.propTypes = {
  headers: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  changeValue: PropTypes.func.isRequired,
  forbiddenValues: PropTypes.object.isRequired,
  validationMessages: PropTypes.object.isRequired
};


const TplEnhancedDialog = ({ title, children = null, dialogProps= {}, confirmProps = { label : "OK"}, cancelProps = { label : "Cancel"}, headers = [], initialValues = {}, forbiddenValues = {}, validate = () => {}, onConfirm = () => {}, showProps = { label: title }, closed = false, autocloseOnConfirm = true }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [controlledClose, setControlledClose] = React.useState(false);
  const [values, setValues] = React.useState(initialValues);
  const [validationMessages, setValidationMessages] = React.useState({});

  const changeValue = (key, value) => {
    let changedValues = Object.assign({}, values, { [key] : value });
    let validateMessages = validate(changedValues);
    if (validateMessages) {
      setValidationMessages(Object.assign({}, validationMessages, { [key] : validateMessages[key] }));
    }

    setValues(changedValues);
  };

  if (controlledClose && dialogOpen && closed) {
    setDialogOpen(false);
    setControlledClose(false);
  }
  return (
    <span>
      <Dialog key={initialValues}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        {...dialogProps}
      >
        <DialogTitle>{title}</DialogTitle>
        <EnhancedDialogContent headers={headers} values={values} forbiddenValues={forbiddenValues} validationMessages={validationMessages} changeValue={changeValue} />
        {children}
        <DialogActions>
          {Object.entries(cancelProps).length > 0 && <TplActionButton {...cancelProps} onClick={() => {
            setControlledClose(false);
            setDialogOpen(false);
            setValidationMessages({});
          }} />}
          {Object.entries(confirmProps).length > 0 && <TplActionButton {...confirmProps} onClick={() => {
            let validateMessages = validate(values) || {};
            setValidationMessages(validateMessages);
            if (Object.keys(validateMessages).length === 0) {
              onConfirm(values);
              if (autocloseOnConfirm) {
                setControlledClose(false);
                setDialogOpen(false);
              }
            }
          }} />}
        </DialogActions>
      </Dialog>
      <TplActionButton {...showProps} onClick={() => {
        setControlledClose(true);
        setDialogOpen(true);
      }} />
    </span>
  );
};

TplEnhancedDialog.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.object,
  confirmProps: PropTypes.object,
  cancelProps: PropTypes.object,
  showProps: PropTypes.object,
  headers: PropTypes.array,
  initialValues: PropTypes.object,
  forbiddenValues: PropTypes.object,
  validate: PropTypes.func,
  onConfirm: PropTypes.func,
  autocloseOnConfirm: PropTypes.bool,
  closed: PropTypes.bool
};

export default TplEnhancedDialog;
