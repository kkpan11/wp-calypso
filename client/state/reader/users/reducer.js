import { combineReducers } from 'calypso/state/utils';
import {
	READER_USER_REQUEST,
	READER_USER_REQUEST_SUCCESS,
	READER_USER_REQUEST_FAILURE,
} from '../action-types';

// Stores the user data
const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER_REQUEST_SUCCESS:
			return {
				...state,
				[ action.userId ]: action.userData,
			};
		case READER_USER_REQUEST_FAILURE:
			return {
				...state,
				[ action.userId ]: null,
			};
		default:
			return state;
	}
};

// Tracks loading states
const requesting = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER_REQUEST:
			return {
				...state,
				[ action.userId ]: true,
			};
		case READER_USER_REQUEST_SUCCESS:
		case READER_USER_REQUEST_FAILURE:
			return {
				...state,
				[ action.userId ]: false,
			};
		default:
			return state;
	}
};

export default combineReducers( {
	items,
	requesting,
} );
