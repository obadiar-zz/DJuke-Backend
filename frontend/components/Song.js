import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import {
  Card,
  CardActions,
  CardHeader,
  CardText
} from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import Modal from 'react-modal';
import Dialog from 'material-ui/Dialog';
import SvgIcon from 'material-ui/SvgIcon';

class Song extends React.Component {
  constructor(props) {
    super(props)
  }

  time() {
    // takes a string representation of a date Object
    let newTime = this.props.time.split(' ')[4];
    let hour = parseInt(newTime.slice(0, 2))
    if (hour > 12) {
      hour = hour - 12;
      return String(hour) + newTime.slice(2) + 'pm'
    }
    else return newTime + "am"
  }

  render() {
    const actions = [
      <RaisedButton
        label="OK"
        primary={true}
        onClick={() => this.closeModal()}
      />,
    ];

    const HomeIcon = (props) => (
      <SvgIcon {...props}>
        <path d="../../img/thumb-drawn.svg" />
      </SvgIcon>
    );

    return (
      <Paper
        className="song"
        zDepth={4}
        >
        <img
          className={'thumbnail'}
          src={this.props.thumbnail}
        />
        <div className={'artist-container'}>
          <div
            className={'title'}
            >
            {this.props.title}
          </div>
          <div
            className={'artist'}
            >
            {this.props.artist}
          </div>
        </div>
        <HomeIcon />
      </Paper>
    );
  }
};

export default Song;
