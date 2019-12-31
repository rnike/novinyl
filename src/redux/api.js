import axios from 'axios';
import { albumUpdate, menuUpdateGroup, playerUpdate } from './actions';

const FETCH_TOKEN_URL = 'https://novon.cc:3001/kkbox/oauth2'; //"https://account.kkbox.com/oauth2/token";
const NEW_HITS_PLAYLISTS = 'https://api.kkbox.com/v1.1/new-hits-playlists?territory=TW';
const NEW_HITS_PLAYLISTS_TRACKS = id => `https://api.kkbox.com/v1.1/new-hits-playlists/${id}/tracks?territory=TW&limit=15`;
// const ALBUM = (id) => `https://api.kkbox.com/v1.1/tracks/${id}/tracks?territory=TW&limit=5`
const TRACK = id => `https://api.kkbox.com/v1.1/tracks/${id}?territory=TW`;
const FEATURED_PLAYLISTS = `https://api.kkbox.com/v1.1/featured-playlists?territory=TW`;
const FEATURED_PLAYLISTS_TRACKS = id => `https://api.kkbox.com/v1.1/featured-playlists/${id}/tracks?territory=TW&limit=15`;
const FEATCH_ARTIST_TRACKS = id => `https://api.kkbox.com/v1.1/artists/${id}/top-tracks?territory=TW&limit=15`;
const SEARCH_URL = q => `https://api.kkbox.com/v1.1/search?q=${q}&territory=TW&type=track&limit=15`;
const SongPlayerUrl = id => `https://widget.kkbox.com/v1/?id=${id}&type=song&terr=TW&autoplay=true`;

var token;

export const NEW_HITS = 'NEW_HITS';
export const FEATURED = 'FEATURED_PLAYLISTS';
export const ARTIST = 'ARTIST';
export const SEARCH = 'SEARCH';
export const AUTOPLAY_FIRST = 'AUTOPLAY_FIRST';
export const AUTOPLAY_LAST = 'AUTOPLAY_LAST';

export const SongPlayerIframe = id => `<iframe src="${SongPlayerUrl(id)}" allow="autoplay"></iframe>`;

export const fetchTrack = async id => {
  const result = await axiosMiddleWare(TRACK(id));
  return result.data;
};

export const fetchSearch = q => async dispatch => {
  if (q !== '') {
    const result = await axiosMiddleWare(SEARCH_URL(q));
    const data = result.data;
    dispatch(albumUpdate({ ...data.tracks, kind: SEARCH }));
    dispatch(playerUpdate({ ...data.tracks.data[0], index: 0 }));
  }
};
export const fetchAlbum = (id, kind, url, autoPlay, offset) => async dispatch => {
  var data, result, fetchUrl;
  switch (kind) {
    case ARTIST:
      fetchUrl = url ? url : FEATCH_ARTIST_TRACKS(id);
      if (offset) {
        fetchUrl += `&offset=${offset}`;
      }
      result = await axiosMiddleWare(fetchUrl);
      data = result.data;
      dispatch(albumUpdate({ ...result.data, kind: kind, albumID: id }));
      break;
    case NEW_HITS:
      fetchUrl = url ? url : NEW_HITS_PLAYLISTS_TRACKS(id);
      if (offset) {
        fetchUrl += `&offset=${offset}`;
      }
      result = await axiosMiddleWare(fetchUrl);
      data = result.data;
      dispatch(albumUpdate({ ...result.data, kind: kind, albumID: id }));
      break;
    case FEATURED:
      fetchUrl = url ? url : FEATURED_PLAYLISTS_TRACKS(id);
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

//Fetch
export const fetchMenuItems = () => dispatch => {
  dispatch(fetchNewHits(true));
  dispatch(fetchFeatured());
};

export const fetchFeatured = () => async dispatch => {
  const result = await axiosMiddleWare(FEATURED_PLAYLISTS);
  dispatch(menuUpdateGroup({ ...result.data, isOpen: false, kind: FEATURED }));
};
export const fetchNewHits = init => async dispatch => {
  const result = await axiosMiddleWare(NEW_HITS_PLAYLISTS);
  dispatch(menuUpdateGroup({ ...result.data, isOpen: true, kind: NEW_HITS }));
  if (init) {
    const first = result.data.data[0];
    if (first) {
      dispatch(fetchAlbum(first.id, NEW_HITS));
    }
  }
};

// Token
const axiosMiddleWare = async url => {
  const ft = await refreshTokenIfNeeded();
  if (ft.error) {
    return ft;
  }
  const retult = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token.token_type} ${token.access_token}`
    }
  });

  if (retult.error) {
    return retult;
  }
  return retult;
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
    token = { ...result.data, received_at: new Date() };
    return {};
  } catch (ex) {
    return {
      error: ex
    };
  }
};
