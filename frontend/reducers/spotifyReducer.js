import * as types from '../actions/types';

const initialState = {
  user: '',
  playlist: '',
  token: 'BQCU85utvU0Es0jNs_wop04KEJj43nKSsJyUNOqkhHs62t8ZXzXYL22bYqpi7O1S4uRAKVYxBPZN-sfgaLjntX6ty6A_pONURUaLsdYOB_JnaNUKH7RHgDMW7uR6hY4oT15Bwfd8i9VIXiFZrypsVBc8jJrKkQ2lOlyaHi_2kdMzWYBZr2SCQcuYal-60RnFWRGE0OfqCEPs-CbqAGtEzndi1KvgAXN4x6ThtkXqctoiSEJaEzAT_9USZ38fYCUQpPFYsHgToCRztU-n-_pR9dDIpCRpXmQVSOtXqghvQW3b73h3IAs5ejXTg8x_nQC3zg',
  confirm_status: false,
};

const copyState = (state) => {
  return Object.assign({}, state)
}

const spotifyReducer = (state = initialState, action) => {
  let newState = copyState(state);
  switch (action.type) {
    case types.SPOTIFY_MOUNT:
      newState.user = action.user;
      newState.playlist = action.playlist;
      return newState;
    case types.SPOTIFY_CONFIRM:
      newState.confirm_status = action.confirm_status;
      return newState;
    default:
      return state;
  }
};

export default spotifyReducer;
