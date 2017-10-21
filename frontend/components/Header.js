import React from 'react';
import { connect } from 'react-redux';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';

import { clearAll } from '../actions/index';

class Header extends React.Component {
  render() {
    return (
      <Toolbar>
        <ToolbarGroup>
          <ToolbarTitle text={'Welcome to DJuke'} />
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

export default connect(null, mapDispatchToProps)(Header);
