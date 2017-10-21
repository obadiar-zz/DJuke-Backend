import React from 'react';
import { connect } from 'react-redux';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';

import { clearAll } from '../actions/index';

class Footer extends React.Component {
  render() {
    return (
      <Toolbar className={'footer'}>
        <ToolbarGroup>

        </ToolbarGroup>
        <ToolbarGroup firstChild={true}>
          <ToolbarTitle text={'Footer'} />
        </ToolbarGroup>
      </Toolbar>
    );
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    onClearAll: () => dispatch(clearAll()),
  };
};

export default connect(null, mapDispatchToProps)(Footer);
