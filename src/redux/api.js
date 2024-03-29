import axios from 'axios';
import { 速爆新歌, 搜尋歌曲, 不支援行動裝置, Safari瀏覽器請先至設定允許此頁面的自動撥放, 如何做, 使用Chrome獲得最佳體驗 } from './language';
import { albumUpdate, menuUpdateGroup, playerUpdate, uiUpdate } from './actions';

const FETCH_TOKEN_URL = 'https://novon.cc/auth'; //"https://account.kkbox.com/oauth2/token";
const NEW_HITS_PLAYLISTS = country => `https://api.kkbox.com/v1.1/new-hits-playlists?territory=${country}`;
const NEW_HITS_PLAYLISTS_TRACKS = (id, country) => `https://api.kkbox.com/v1.1/new-hits-playlists/${id}/tracks?territory=${country}&limit=15`;
const TRACK = (id, country) => `https://api.kkbox.com/v1.1/tracks/${id}?territory=${country}`;
const FEATURED_PLAYLISTS = country => `https://api.kkbox.com/v1.1/featured-playlists?territory=${country}`;
const FEATURED_PLAYLISTS_TRACKS = (id, country) => `https://api.kkbox.com/v1.1/featured-playlists/${id}/tracks?territory=${country}&limit=15`;
const FEATCH_ARTIST_TRACKS = (id, country) => `https://api.kkbox.com/v1.1/artists/${id}/top-tracks?territory=${country}&limit=15`;
const SEARCH_URL = (q, country) => `https://api.kkbox.com/v1.1/search?q=${q}&territory=${country}&type=track&limit=15`;
const SongPlayerUrl = (id, country) => `https://widget.kkbox.com/v1/?id=${id}&type=song&terr=${country}&autoplay=true`;

export var token;

export const NEW_HITS = 'NEW_HITS';
export const FEATURED = 'FEATURED_PLAYLISTS';
export const ARTIST = 'ARTIST';
export const SEARCH = 'SEARCH';
export const AUTOPLAY_FIRST = 'AUTOPLAY_FIRST';
export const AUTOPLAY_LAST = 'AUTOPLAY_LAST';

export const SongPlayerIframe = id => `<iframe src="${SongPlayerUrl(id, token.country)}" allow="autoplay"></iframe>`;

export const fetchTrack = async id => {
  const result = await axiosMiddleWare(TRACK(id, token.country));
  return result.data;
};

export const fetchSearch = q => async dispatch => {
  if (q !== '') {
    const result = await axiosMiddleWare(SEARCH_URL(q, token.country));
    const data = result.data;
    dispatch(albumUpdate({ ...data.tracks, kind: SEARCH }));
    dispatch(playerUpdate({ ...data.tracks.data[0], index: 0 }));
  }
};
export const fetchAlbum = (id, kind, url, autoPlay, offset) => async dispatch => {
  var data, result, fetchUrl;
  switch (kind) {
    case ARTIST:
      fetchUrl = url ? url : FEATCH_ARTIST_TRACKS(id, token.country);
      if (offset) {
        fetchUrl += `&offset=${offset}`;
      }
      result = await axiosMiddleWare(fetchUrl);
      data = result.data;
      dispatch(albumUpdate({ ...result.data, kind: kind, albumID: id }));
      break;
    case NEW_HITS:
      fetchUrl = url ? url : NEW_HITS_PLAYLISTS_TRACKS(id, token.country);
      if (offset) {
        fetchUrl += `&offset=${offset}`;
      }
      result = await axiosMiddleWare(fetchUrl);
      data = result.data;
      dispatch(albumUpdate({ ...result.data, kind: kind, albumID: id }));
      break;
    case FEATURED:
      fetchUrl = url ? url : FEATURED_PLAYLISTS_TRACKS(id, token.country);
      if (offset) {
        fetchUrl += `&offset=${offset}`;
      }
      result = await axiosMiddleWare(fetchUrl);
      data = result.data;
      dispatch(albumUpdate({ ...result.data, kind: kind, albumID: id }));
      break;
    case SEARCH:
      if (url) {
        fetchUrl = url;
        if (offset) {
          fetchUrl += `&offset=${offset}`;
        }
        result = await axiosMiddleWare(fetchUrl);
        data = result.data.tracks;
        dispatch(albumUpdate({ ...data, kind: kind }));
      }
      break;
    default:
      break;
  }

  if (data) {
    if (autoPlay === AUTOPLAY_LAST) {
      dispatch(
        playerUpdate({
          ...data.data[data.data.length - 1],
          index: data.data.length - 1
        })
      );
    } else {
      dispatch(playerUpdate({ ...data.data[0], index: 0 }));
    }
  }
};

export const fetchSelector = kind => async () => {
  switch (kind) {
    default:
      break;
  }
};

// Fetch
export const fetchMenuItems = () => async dispatch => {
  const err = await axiosMiddleWare();
  dispatch(
    uiUpdate({
      country: token.country,
      language: {
        速爆新歌: 速爆新歌(token.country),
        搜尋歌曲: 搜尋歌曲(token.country),
        不支援行動裝置: 不支援行動裝置(token.country),
        Safari瀏覽器請先至設定允許此頁面的自動撥放: Safari瀏覽器請先至設定允許此頁面的自動撥放(token.country),
        如何做: 如何做(token.country),
        使用Chrome獲得最佳體驗: 使用Chrome獲得最佳體驗(token.country)
      },
      error: err && err.error
    })
  );
  if (!err) {
    dispatch(fetchNewHits(true));
    dispatch(fetchFeatured());
  }
};

export const fetchFeatured = () => async dispatch => {
  const result = await axiosMiddleWare(FEATURED_PLAYLISTS(token.country));
  dispatch(menuUpdateGroup({ ...result.data, isOpen: false, kind: FEATURED }));
};
export const fetchNewHits = init => async dispatch => {
  const result = await axiosMiddleWare(NEW_HITS_PLAYLISTS(token.country));
  dispatch(menuUpdateGroup({ ...result.data, isOpen: true, kind: NEW_HITS }));
  if (init) {
    if (result.data) {
      const first = result.data.data[0];
      if (first) {
        dispatch(fetchAlbum(first.id, NEW_HITS));
      }
    } else if (result.error) {
      dispatch(uiUpdate({ error: result.error.message}));
    }
  }
};

// Token
const axiosMiddleWare = async url => {
  const ft = await refreshTokenIfNeeded();
  if (ft.error) {
    return ft;
  }
  if (url) {
    try {
      const retult = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token.token_type} ${token.access_token}`
        }
      });
      return retult;
    } catch (ex) {
      return  ex.response.data;
    }
  }
};

const refreshTokenIfNeeded = async () => {
  if (shouldRefreshToken()) {
    const result = await fetchToken();
    return result;
  }
  return {};
};
const shouldRefreshToken = () => {
  if (!token) {
    return true;
  } else {
    var dif = (new Date().getTime() - token.received_at) / 1000;
    if (dif > token.expires_in) {
      return true;
    }
  }
  return false;
};
const fetchToken = async () => {
  try {
    const result = await axios.post(FETCH_TOKEN_URL);
    if (result.error) {
      return result;
    }
    token = { ...result.data, country: 'TW', received_at: new Date() };
    return {};
  } catch (ex) {
    return {
      error: ex
    };
  }
};
