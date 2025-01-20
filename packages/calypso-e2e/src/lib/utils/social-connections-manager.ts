import { Page } from 'playwright';

/**
 * A class to help manage social connections in the UI.
 */
export class SocialConnectionsManager {
	/**
	 * Constructor to set the props
	 */
	constructor(
		private page: Page,
		private siteId: number
	) {
		// Ensure the methods are bound to the class.
		this.isTargetUrl = this.isTargetUrl.bind( this );
	}

	/**
	 * Get the patterns for the social connections URLs
	 */
	get patterns() {
		return {
			CONNECTION_TESTS_ON_SIMPLE: new RegExp(
				// The request that deals with connection test results on Simple sites
				`wpcom/v2/sites/${ this.siteId }/publicize/connection-test-results`
			),
			CONNECTION_TESTS_ON_ATOMIC: new RegExp(
				// The request that deals with connection test results on Atomic sites
				'wpcom/v2/publicize/connection-test-results'
			),
			GET_POST: new RegExp(
				// The request that gets the post data in the editor
				`wp/v2/sites/${ this.siteId }/posts/[0-9]+`
			),
			POST_AUTOSAVES: new RegExp(
				// The request that deals with post autosaves in the editor
				`wp/v2/sites/${ this.siteId }/posts/[0-9]+/autosaves`
			),
		};
	}

	/**
	 * Get the test connections
	 */
	get testConnections() {
		return [
			{
				connection_id: '123456',
				display_name: 'Tumblr Test Connection',
				service_name: 'tumblr',
			},
			{
				connection_id: '654321',
				display_name: 'Bluesky Test Connection',
				service_name: 'bluesky',
			},
		];
	}

	/**
	 * Whether the URL is the one we want to intercept
	 */
	isTargetUrl( url: URL ) {
		const { GET_POST, POST_AUTOSAVES, CONNECTION_TESTS_ON_SIMPLE, CONNECTION_TESTS_ON_ATOMIC } =
			this.patterns;

		// We don't want to intercept autosave requests.
		if ( GET_POST.test( url.pathname ) && ! POST_AUTOSAVES.test( url.pathname ) ) {
			return true;
		}

		return (
			CONNECTION_TESTS_ON_SIMPLE.test( url.pathname ) ||
			CONNECTION_TESTS_ON_ATOMIC.test( url.toString() )
		);
	}

	/**
	 * Intercept the requests and to modify the response
	 */
	async interceptRequests() {
		await this.page.route( this.isTargetUrl, async ( route ) => {
			// Fetch original response.
			const response = await route.fetch();

			const result = await response.json();

			const url = route.request().url();

			if ( this.patterns.GET_POST.test( url ) ) {
				// For posts, add a test connection to post attributes.
				result.body.jetpack_publicize_connections.push( ...this.testConnections );
			} else if ( this.patterns.CONNECTION_TESTS_ON_SIMPLE.test( url ) ) {
				// For connection tests, add test connections to the body.
				// Because the response is an object {"body":[],"status":200,"headers":{}}
				result.body.push( ...this.testConnections );
			} else if ( this.patterns.CONNECTION_TESTS_ON_ATOMIC.test( url ) ) {
				// For Atomic connection tests, add test connections directly to the result.
				// because the response is already an array.
				result.push( ...this.testConnections );
			}

			await route.fulfill( {
				response,
				body: JSON.stringify( result ),
			} );
		} );
	}

	/**
	 * Clear the intercepts
	 */
	async clearIntercepts() {
		await this.page.unroute( this.isTargetUrl );
	}

	/**
	 * Wait for the connection test results response.
	 */
	async waitForConnectionTests() {
		await this.page.waitForResponse( ( response ) => {
			return (
				this.patterns.CONNECTION_TESTS_ON_SIMPLE.test( response.url() ) ||
				this.patterns.CONNECTION_TESTS_ON_ATOMIC.test( response.url() )
			);
		} );
	}
}
