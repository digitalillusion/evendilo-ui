import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Popper,
  TextField,
  Paper,
  Chip,
  MenuItem
} from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import Select from 'react-select';
import { isEmpty, isObject } from "../../functions";
import { injectIntl } from "react-intl";

const styles = theme => ({
  input: {
    display: 'flex',
    padding: 0,
    height: `${theme.spacing(5)}px`
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chip: {
    margin: `${theme.spacing(0.5)}px ${theme.spacing(0.25)}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1000,
    left: 0,
    right: 0,
  },
  popper: {
    zIndex: 10000
  },
  divider: {
    height: theme.spacing(2),
  },
});

const NoOptionsMessage = props => {
  if (props.selectProps.isAdd) {
    return <Option innerProps={{
      onClick : () => {
        props.selectProps.onAddOption(props.selectProps.inputValue)
      }
    }}>{props.selectProps.inputValue}</Option>
  } else {
    return (
      <Typography
        color='textSecondary'
        className={props.selectProps.classes.noOptionsMessage}
        {...props.innerProps}
      >
        {props.children}
      </Typography>
    )
  }
}

const inputComponent = ({ inputRef, ...props }) => {
  return <div ref={inputRef} {...props} />;
}

const Control = props => {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

const Option = props => {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component='div'
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

const Placeholder = props => {
  return (
    <Typography
      color='textSecondary'
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.selectProps.textFieldProps ? props.selectProps.textFieldProps.placeholder : undefined || props.children}
    </Typography>
  );
}

const SingleValue = props => {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      {...(props.selectProps.isCancellable ? {
          onDelete: props.clearValue,
          deleteIcon: <CancelIcon {...props.removeProps} />
      } : {})}
    />
  );
}

const ValueContainer = props => {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

const MultiValue = props => {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    />
  );
}

const Menu = props => {
  let popperNode = props.selectProps.anchorEl()
  return (
    <Popper anchorEl={popperNode} open={props.children} className={props.selectProps.classes.popper}>
      <Paper square className={props.selectProps.classes.paper} {...props.innerProps} style={{ width : popperNode.clientWidth, transform : '', left: - popperNode.clientWidth * 0.5 }}>
        {props.children}
      </Paper>
    </Popper>
  );
}

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

const menuItemToOptionMapper = menuItem => {
  return { value: menuItem.props.value, label: menuItem.props.children }
}

class TplSearchBar extends React.Component {

  constructor(props) {
    super(props)

    const inputToStateMapper = inp => {
      let selectedOptions = []
      if (inp && inp.length > 0) {
        let selectedInput = inp.split(',')

        this.state.menuItems.forEach(menuItem => {
          let value = menuItem.props.value
          if (selectedInput.includes(value)) {
            selectedOptions.push(menuItemToOptionMapper(menuItem))
            selectedInput.splice(selectedInput.indexOf(value), 1)
          }
        })
        if (props.selectProps.isAdd) {
          selectedInput.forEach(value => {
            let mapper = props.selectProps.additionalOptionsMapper || (option => { return { value : option, label : option } })
            let mapped = mapper(value)
            this.state.menuItems.push(<MenuItem value={mapped.value}>{mapped.label}</MenuItem>)
            selectedOptions.push(mapped)
          })
        }
      }
      return selectedOptions
    }

    this.state = {
      menuItems: [],
      search : []
    }
    this.refPopperNode = React.createRef()
    for (let c of props.children) {
      this.state.menuItems.push(c)
    }
    if (props.input) {
      this.state.search = inputToStateMapper(props.input.value)
    }
    this.state.menuItems.sort((mi1, mi2) => (mi1.props.value + '').localeCompare(mi2.props.value + ''))
  }


  render() {
    const { children, classes, theme, selectProps, optionsMapper, input } = this.props;

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    }


    let menuItemsToOptionsMapper = optionsMapper || ((menuItems, currentValue) => {
      let validOptions = [];
      menuItems.forEach(menuItem => {
        if (!currentValue || !currentValue.map(cv => cv.value).includes(menuItem.props.value)) {
          validOptions.push(menuItem)
        }
      })
      return validOptions.map(menuItem => menuItemToOptionMapper(menuItem));
    })
    let stateToInputMapper = search => {
      let parts = (search || []).map(s => s.value)
      if (parts.length > 0) {
        if (parts.length === 1 && isObject(parts[0])) {
          return parts[0]
        }
        return parts.join()
      }
      return null
    }

    const options = menuItemsToOptionsMapper(this.state.menuItems, this.state.search)
    return <div ref={this.refPopperNode}><Select
      key={this.state.search.map(s => s.value).join()}
      {...input}
      classes={classes}
      styles={selectStyles}
      components={components}
      options={options}
      value={this.state.search}
      onChange={search => {
        let searchArray = isEmpty(search) || Array.isArray(search) ? search || [] : [search]
        this.setState({
          search: searchArray
        }, () => {
          if (input && input.onChange) {
            input.onChange(stateToInputMapper(searchArray))
          }
        })
      }}
      onBlur={() => {
        if (input && input.onBlur) {
          input.onBlur(stateToInputMapper(this.state.search))
        }
      }}
      onAddOption={option => {
        let mapper = selectProps.additionalOptionsMapper || (option => { return { value : option, label : option } })
        let mapped = mapper(option)

        let menuItems = []
        this.state.menuItems.forEach(menuItem => menuItems.push(menuItem))
        menuItems.push(<MenuItem value={mapped.value}>{mapped.label}</MenuItem>)
        let search = [];
        if (selectProps.isMulti) {
          this.state.search.forEach(s => search.push(s))
        }
        search.push(mapped)

        menuItems.sort((mi1, mi2) => (mi1.props.value + '').localeCompare(mi2.props.value + ''))
        this.setState({
          search: search,
          menuItems: menuItems
        }, () => {
          if (input) {
            input.onChange(stateToInputMapper(search))
          }
        })
      }}
      {...selectProps}
      anchorEl={() => this.refPopperNode.current}
    /></div>
  }
}

export default withStyles(styles, { withTheme: true })(injectIntl(TplSearchBar));