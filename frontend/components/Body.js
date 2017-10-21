import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

// import components to render
import Spotify from './Spotify'
import Youtube from './Youtube'
import Queue from './Queue'

class Body extends React.Component {
  render() {
    return (
      <div className={'container body'}>
        <div className='clients'>
          <Spotify />
          <Youtube />
        </div>
        <Queue />
      </div>
    );
  }
};

export default Body;
