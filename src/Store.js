// redux store
// import statements
import { createStore, applyMiddleware } from 'redux';
import { userReducer } from './state/userState';
import { settingsReducer } from './state/settingsState';
// combine reducers
import { combineReducers } from 'redux';

const Reducers = combineReducers({userReducer, settingsReducer})

export const Store = createStore(Reducers);