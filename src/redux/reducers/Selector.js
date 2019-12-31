import { SELECTOR_UPDATE } from '../actions';
const initialState = {};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case SELECTOR_UPDATE:
      return { ...state, ...payload };

    default:
      return state;
  }
};
