import { MENU_UPDATE, MENU_UPDATE_GROUP } from '../actions';
import { FEATURED, NEW_HITS, ARTIST } from '../api';
const initialState = {
  isOpen: false
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case MENU_UPDATE:
      return { ...state, ...payload };
    case MENU_UPDATE_GROUP:
      if (payload.kind) {
        switch (payload.kind) {
          case FEATURED:
            return {
              ...state,
              FETURED: payload
            };
          case NEW_HITS:
            return {
              ...state,
              NEW_HITS: payload
            };
          case ARTIST:
            return {
              ...state,
              ARTIST: payload
            };
          default:
            break;
        }
      }
      return state;
    default:
      return state;
  }
};
