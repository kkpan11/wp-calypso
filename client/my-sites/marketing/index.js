import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	connections,
	layout,
	marketingTools,
	redirectConnections,
	redirectDefaultConnectionsDomain,
	redirectMarketingTools,
	redirectMarketingBusinessTools,
	redirectSharingButtons,
	sharingButtons,
	traffic,
} from './controller';

export default function () {
	page( '/marketing/do-it-for-me*', function redirectToDIFMLandingPage() {
		window.location.replace( 'https://wordpress.com/website-design-service/' );
	} );

	page( '/marketing/ultimate-traffic-guide*', function redirectToWPCoursesPage() {
		window.location.replace( 'https://wordpress.com/learn/courses/intro-to-seo/' );
	} );

	const paths = [
		'/marketing',
		'/marketing/connections',
		'/marketing/sharing-buttons',
		'/marketing/tools',
		'/marketing/traffic',
		'/sharing',
		'/sharing/buttons',
	];

	paths.forEach( ( path ) => page( path, ...[ siteSelection, sites, makeLayout, clientRender ] ) );

	page( '/marketing/connection/:service', redirectDefaultConnectionsDomain );

	page( '/sharing/:domain', redirectConnections );
	page( '/sharing/buttons/:domain', redirectSharingButtons );

	page( '/marketing/:domain', redirectMarketingTools );
	page( '/marketing/business-tools/:domain', redirectMarketingBusinessTools );

	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		page( '/marketing/tools/:site', ( context ) => {
			page.redirect( `/sites/marketing/tools/${ context.params.site }` );
		} );
		page( '/marketing/connections/:site', ( context ) => {
			page.redirect( `/sites/marketing/connections/${ context.params.site }` );
		} );
		page( '/marketing/traffic/:site', ( context ) => {
			page.redirect( `/sites/marketing/traffic/${ context.params.site }` );
		} );
		page( '/marketing/sharing-buttons/:site', ( context ) => {
			page.redirect( `/sites/marketing/sharing-buttons/${ context.params.site }` );
		} );
	} else {
		page(
			'/marketing/connections/:domain',
			siteSelection,
			navigation,
			connections,
			layout,
			makeLayout,
			clientRender
		);

		page(
			'/marketing/traffic/:domain',
			siteSelection,
			navigation,
			traffic,
			layout,
			makeLayout,
			clientRender
		);

		page(
			'/marketing/sharing-buttons/:domain',
			siteSelection,
			navigation,
			sharingButtons,
			layout,
			makeLayout,
			clientRender
		);

		page(
			'/marketing/tools/:domain',
			siteSelection,
			navigation,
			marketingTools,
			layout,
			makeLayout,
			clientRender
		);
	}
}
