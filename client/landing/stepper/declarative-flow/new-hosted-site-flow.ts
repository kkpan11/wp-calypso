import { isFreeHostingTrial, isDotComPlan } from '@automattic/calypso-products';
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useLayoutEffect } from 'react';
import { recordFreeHostingTrialStarted } from 'calypso/lib/analytics/ad-tracking/ad-track-trial-start';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
	getSignupCompleteSiteID,
	setSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';
import { useDispatch as reduxUseDispatch, useSelector } from 'calypso/state';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { useQuery } from '../hooks/use-query';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect, UserSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import './internals/new-hosted-site-flow.scss';

function useShowDomainStep(): boolean {
	const query = useQuery();
	return query.has( 'showDomainStep' );
}

const hosting: Flow = {
	name: NEW_HOSTED_SITE_FLOW,
	isSignupFlow: true,
	useSteps() {
		const showDomainStep = useShowDomainStep();
		return [
			...( showDomainStep
				? [
						{
							slug: 'domains',
							asyncComponent: () => import( './internals/steps-repository/domains' ),
						},
				  ]
				: [] ),
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'trialAcknowledge',
				asyncComponent: () => import( './internals/steps-repository/trial-acknowledge' ),
			},
			{
				slug: 'createSite',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const { setPlanCartItem, resetCouponCode } = useDispatch( ONBOARD_STORE );
		const planCartItem = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			[]
		);
		const couponCode = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getCouponCode(),
			[]
		);

		const query = useQuery();
		const queryParams = Object.fromEntries( query );
		const plan = queryParams.plan;
		const flowName = this.name;
		const showDomainStep = useShowDomainStep();

		const goBack = () => {
			if ( _currentStepSlug === 'plans' ) {
				if ( showDomainStep ) {
					return navigate( 'domains' );
				}
				return window.location.assign( '/sites?hosting-flow=true' );
			}
			if ( _currentStepSlug === 'trialAcknowledge' ) {
				navigate( 'plans' );
			}
		};

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			if ( providedDependencies.siteId ) {
				setSignupCompleteSiteID( providedDependencies.siteId );
			}

			switch ( _currentStepSlug ) {
				case 'domains': {
					// If the plan is already supplied as a query param, add it to cart, and skip plans step
					if ( plan && isDotComPlan( { product_slug: plan } ) ) {
						setPlanCartItem( {
							product_slug: plan,
						} );
						return navigate( 'createSite' );
					}
					return navigate( 'plans' );
				}
				case 'plans': {
					const productSlug = ( providedDependencies.plan as MinimalRequestCartProduct )
						.product_slug;

					setPlanCartItem( {
						product_slug: productSlug,
						extra: {
							...( queryParams?.utm_source && {
								hideProductVariants: queryParams.utm_source === 'wordcamp',
							} ),
						},
					} );

					if ( isFreeHostingTrial( productSlug ) ) {
						return navigate( 'trialAcknowledge' );
					}

					setSignupCompleteFlowName( flowName );
					return navigate( 'createSite' );
				}

				case 'trialAcknowledge': {
					return navigate( 'createSite' );
				}

				case 'createSite':
					return navigate( 'processing' );

				case 'processing': {
					const hasStudioSyncSiteId = queryParams.studioSiteId;
					const siteId = providedDependencies.siteId || getSignupCompleteSiteID();
					const destinationParams: Record< string, string > = {
						siteId,
					};
					if ( hasStudioSyncSiteId ) {
						destinationParams[ 'redirect_to' ] = addQueryArgs( `/home/${ siteId }`, {
							studioSiteId: queryParams.studioSiteId,
						} );
					}
					// Purchasing Business or Commerce plans will trigger an atomic transfer, so go to stepper flow where we wait for it to complete.
					const destination = addQueryArgs( '/setup/transferring-hosted-site', destinationParams );

					// If the product is a free trial, record the trial start event for ad tracking.
					if ( planCartItem && isFreeHostingTrial( planCartItem?.product_slug ) ) {
						recordFreeHostingTrialStarted( flowName );
					}

					if ( providedDependencies.goToCheckout ) {
						persistSignupDestination( destination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );

						couponCode && resetCouponCode();
						return window.location.assign(
							addQueryArgs(
								`/checkout/${ encodeURIComponent(
									( providedDependencies?.siteSlug as string ) ?? ''
								) }`,
								{ redirect_to: destination, coupon: couponCode }
							)
						);
					}

					return navigate( 'plans' );
				}
			}
		};

		return {
			goBack,
			submit,
		};
	},
	useSideEffect( currentStepSlug ) {
		const flowName = this.name;
		const dispatch = reduxUseDispatch();
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );
		const query = useQuery();
		const isEligible = useSelector( isUserEligibleForFreeHostingTrial );
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const queryParams = Object.fromEntries( query );

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: addQueryArgs( `/setup/${ flowName }`, { ...queryParams } ),
		} );

		useLayoutEffect( () => {
			const urlWithQueryParams = addQueryArgs( '/setup/new-hosted-site', queryParams );

			if ( ! userIsLoggedIn ) {
				window.location.assign(
					addQueryArgs( logInUrl, {
						...queryParams,
						flow: 'new-hosted-site',
					} )
				);
			}

			if ( currentStepSlug === 'trialAcknowledge' && ! isEligible ) {
				window.location.assign( urlWithQueryParams );
			}
		}, [ userIsLoggedIn, isEligible, currentStepSlug, queryParams, logInUrl ] );

		useEffect( () => {
			if ( queryParams.studioSiteId ) {
				recordTracksEvent( 'calypso_studio_sync_step', {
					flow: NEW_HOSTED_SITE_FLOW,
					step: currentStepSlug,
				} );
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [ currentStepSlug ] );

		useEffect(
			() => {
				if ( currentStepSlug === undefined ) {
					resetOnboardStore();
				}
				dispatch( setSelectedSiteId( null ) );
			},
			// We only need to reset the store and/or check the `campaign` param when the flow is mounted.
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[]
		);
	},
};

export default hosting;
