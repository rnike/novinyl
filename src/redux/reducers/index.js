import { combineReducers } from 'redux';
import Menu from './Menu';
import Album from './Album';
import Selector from './Selector';
import Player from './Player';
import UI from './UI';
export default combineReducers({ Menu, Album, Selector, Player, UI });
