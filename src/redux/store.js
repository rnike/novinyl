import { createStore, applyMiddleware } from 'redux';
import Reducer from './reducers';
import thunkMiddleware from 'redux-thunk';
// import { createLogger } from 'redux-logger';

// const loggerMiddleware = createLogger();
const store = createStore(
  Reducer,
  applyMiddleware(
    thunkMiddleware
    //  , loggerMiddleware
  )
);
export default store;
