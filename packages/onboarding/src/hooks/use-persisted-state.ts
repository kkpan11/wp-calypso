import { useCallback, useId, useState } from 'react';
import { useMatch } from 'react-router';

const TWENTY_MINUTES = 20 * 60 * 1000;
const VERSION = 1;
const KEY = '@automattic/persisted-state';

function setPersistedState( key: string, state: unknown, storage: Storage ) {
	storage.setItem( key, JSON.stringify( state ) );
	storage.setItem( key + 'time', Date.now().toString() );
}

function getPersistedState( key: string, storage: Storage, TTL: number ) {
	const state = storage.getItem( key );
	if ( state ) {
		const time = parseInt( storage.getItem( key + 'time' ) || '0' );
		if ( Date.now() - time > TTL ) {
			storage.removeItem( key );
			storage.removeItem( key + 'time' );
		} else {
			return JSON.parse( state );
		}
	}
}

type Options = {
	/**
	 * The used storage, defaults to sessionStorage.
	 */
	storage: Storage;
	/**
	 * Time to live in milliseconds. Defaults to 20 minutes. If the date is older, it will be deleted.
	 */
	TTL: number;
};

/**
 * A hook similar to useState, but persists the state. Uses `flow`, `step` and `lang`, and the component location in the tree as keys.
 * The cool thing about this is that it doesn't need any unique IDs. It uses React's useId.
 * @param defaultValue the initial value of the state.
 * @returns a tuple with the state and a function to update it.
 */
export function usePersistedState< T >(
	defaultValue?: T,
	options: Options = { storage: localStorage, TTL: TWENTY_MINUTES }
): [ T, ( newState: T ) => void ] {
	const match = useMatch( '/:flow/:step?/:lang?' );
	// This gives unique id for each instance of the hook in the tree.
	const id = useId();
	const { flow = 'flow', step = 'step', lang = 'lang' } = match?.params || {};
	const key = [ VERSION, KEY, flow, step, lang, id ].join( '-' );

	const [ state, _setState ] = useState< T >(
		getPersistedState( key, options.storage, options.TTL ) || defaultValue
	);

	const setState = useCallback(
		( newState: T ) => {
			_setState( newState );
			setPersistedState( key, newState, options.storage );
		},
		[ _setState, key, options.storage ]
	);

	return [ state, setState ];
}
