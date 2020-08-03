import React, {Component} from 'react';
import {CircularProgress} from '@material-ui/core';
import { injectIntl } from "react-intl";

class TplLoading extends Component {

    render() {
        return (<div style={{width: '100%', margin: '60px 0', textAlign: 'center'}}>
            <CircularProgress/>
        </div>)
    }

}

export default injectIntl(TplLoading);