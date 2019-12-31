import { ALBUM_UPDATE } from '../actions';
const initialState = {};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ALBUM_UPDATE:
      return { ...state, ...payload };

    default:
      return state;
  }
};
