import * as types from '../actions/types';

const initialState = {list:
  [
    {
      title: "Sandstorm - Radio Edit",
      artist: "Darude",
      duration: "3:45",
      id: "24CXuh2WNpgeSYUOvz14jk",
      upvotes: {},
      payment: 0,
      requestor_ip: "10.2.106.85",
      thumbnail:"https://i.scdn.co/image/bf39d603ce7421e9f8583c0969e02d4c0b3dd33c",
      time: "Fri Oct 20 2017 22:20:28 GMT-0700 (PDT)"
    },
    {
      title: "Despacito - Remix",
      artist: "Luis Fonsi, Daddy Yankee, Justin Bieber",
      duration: "3:48",
      id: "6rPO02ozF3bM7NnOV4h6s2",
      upvotes: {},
      payment: 0,
      requestor_ip: "10.2.106.85",
      thumbnail: "https://i.scdn.co/image/edcc53317411b5e025e920857fb0f871c4087ce9",
      time: "Fri Oct 20 2017 22:21:09 GMT-0700 (PDT)"
    }
  ]
};

const copyState = (state) => {
  let newState = {list: []}
  state.list.forEach(song => {
    let newUpvotes = Object.assign({}, song.upvotes)
    let newSong = Object.assign({}, song, {upvotes: newUpvotes})
    newState.list.push(newSong)
  })
  return newState
}

const songListReducer = (state = initialState, action) => {
  let newState = copyState(state);
  switch (action.type) {
    case types.UPDATE_QUEUE:
      newState = action.data;
      newState.list.reverse()
      return newState;
    default:
      return state;
  }
};

export default songListReducer;
