import { type Callback } from '@automattic/calypso-router';

export const a8cForAgenciesContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <div>Secondary</div>;
	context.primary = <div>Hello, World!</div>;

	next();
};