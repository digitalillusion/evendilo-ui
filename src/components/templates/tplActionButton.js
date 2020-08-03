import React from 'react';
import PropTypes from 'prop-types';

import {
  IconButton,
  Typography
} from '@material-ui/core';

const TplActionButton = ({label = "", className="", color = "primary", icon = null, onClick = () => {}, contained = undefined, name = ""}) => {
  if (contained) {
    return  <div className={className} color={color} variant="contained" onClick={onClick}>
      {icon}
      <Typography className={className} variant="button" color={color}>{label}</Typography>
    </div>;
  } else {
    return <IconButton name={name} className={className} color={color} variant="contained" onClick={onClick}>
      {icon}
      <Typography className={className} variant="button" color={color}>{label}</Typography>
    </IconButton>;
  }
};

TplActionButton.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.object,
  onClick: PropTypes.func,
  contained: PropTypes.bool
};

export default TplActionButton;
