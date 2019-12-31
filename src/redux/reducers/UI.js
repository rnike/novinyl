import {UI_UPDATE} from '../actions'
const initialState = {
    background:'wihte'
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case UI_UPDATE:
      return { ...state, ...payload };

    default:
      return state;
  }
};
