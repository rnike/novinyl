export const MENU_UPDATE = 'MENU_UPDATE';
export const menuUpdate = payload => ({
  type: MENU_UPDATE,
  payload
});
export const MENU_UPDATE_GROUP = 'MENU_UPDATE_GROUP';
export const menuUpdateGroup = payload => ({
  type: MENU_UPDATE_GROUP,
  payload
});

export const SELECTOR_UPDATE = 'SELECTOR_UPDATE';
export const selectorUpdate = payload => ({
  type: SELECTOR_UPDATE,
  payload
});

export const ALBUM_UPDATE = 'ALBUM_UPDATE';
export const albumUpdate = payload => ({ type: ALBUM_UPDATE, payload });

export const PLAYER_UPDATE = 'PLAYER_UPDATE';
export const playerUpdate = payload => ({
  type: PLAYER_UPDATE,
  payload
});

export const UI_UPDATE = 'UI_UPDATE';
export const uiUpdate = payload => ({
  type: UI_UPDATE,
  payload
});
