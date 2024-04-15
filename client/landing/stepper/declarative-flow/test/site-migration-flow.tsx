/**
 * @jest-environment jsdom
 */
import { addQueryArgs } from '../../../../lib/url';
import { goToCheckout } from '../../utils/checkout';
import { STEPS } from '../internals/steps';
import siteMigrationFlow from '../site-migration-flow';
import { getFlowLocation, renderFlow } from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '../../utils/checkout' );
describe( 'Site Migration Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { assign: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		jest.resetAllMocks();
	} );

	describe( 'navigation', () => {
		it( 'redirects the user to the migrate or import page when the platform is wordpress', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				dependencies: {
					action: 'continue',
					platform: 'wordpress',
					from: 'https://site-to-be-migrated.com',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }?from=https%3A%2F%2Fsite-to-be-migrated.com&siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );

		it( 'redirects the user to the import content flow when was not possible to indentify the platform', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );
			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				dependencies: {
					action: 'continue',
					platform: 'unknown',
					from: 'https://example-to-be-migrated.com',
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				addQueryArgs(
					{
						siteSlug: 'example.wordpress.com',
						from: 'https://example-to-be-migrated.com',
						origin: 'site-migration-identify',
						backToFlow: '/site-migration/site-migration-identify',
					},
					'/setup/site-setup/importList'
				)
			);
		} );

		it( 'redirects the user to the import content flow when the user skip the plaform identification', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );
			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				dependencies: {
					action: 'skip_platform_identification',
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				addQueryArgs(
					{
						siteSlug: 'example.wordpress.com',
						origin: 'site-migration-identify',
						backToFlow: '/site-migration/site-migration-identify',
					},
					'/setup/site-setup/importList'
				)
			);
		} );

		it( 'migrate redirects from the import-from page to bundleTransfer step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.BUNDLE_TRANSFER.slug,
				dependencies: {
					destination: 'migrate',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.PROCESSING.slug }`,
				state: {
					bundleProcessing: true,
				},
			} );
		} );

		it( 'redirects the user to the checkout page with the correct destination params', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentURL: `/setup/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&from=https://site-to-be-migrated.com`,
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				dependencies: {
					goToCheckout: true,
				},
			} );

			expect( goToCheckout ).toHaveBeenCalledWith( {
				destination: `/setup/site-migration/${ STEPS.BUNDLE_TRANSFER.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com`,
				flowName: 'site-migration',
				siteSlug: 'example.wordpress.com',
				stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
			} );
		} );

		it( 'upgrade redirects from the import-from page to site-migration-upgrade-plan page', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug,
				dependencies: {
					destination: 'upgrade',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/site-migration-upgrade-plan',
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'redirects from upgrade-plan to bundleTransfer step after selecting a free trial', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				dependencies: {
					freeTrialSelected: true,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/bundleTransfer',
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'redirects from upgrade-plan to verifyEmail if user is unverified', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				dependencies: {
					verifyEmail: true,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.VERIFY_EMAIL.slug }`,
				state: null,
			} );
		} );

		it( 'redirects from verifyEmail to site-migration-assign-trial-plan step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.VERIFY_EMAIL.slug,
				dependencies: {
					verifyEmail: true,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN.slug }`,
				state: null,
			} );
		} );

		it( 'redirects from site-migration-assign-trial-plan step to bundleTransfer step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/bundleTransfer',
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );
	} );

	describe( 'goBack', () => {
		it( 'backs to the identify step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );

		it( 'redirects the user to the goal step when going back from the identify step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/setup/site-setup/goals?siteSlug=example.wordpress.com'
			);
		} );
	} );
} );
