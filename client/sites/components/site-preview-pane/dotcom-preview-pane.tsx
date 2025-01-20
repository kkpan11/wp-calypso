import config from '@automattic/calypso-config';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo, useEffect } from 'react';
import ItemView from 'calypso/layout/hosting-dashboard/item-view';
import HostingFeaturesIcon from 'calypso/sites/hosting-features/components/hosting-features-icon';
import { areHostingFeaturesSupported } from 'calypso/sites/hosting-features/features';
import { useStagingSite } from 'calypso/sites/tools/staging-site/hooks/use-staging-site';
import { getMigrationStatus } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { StagingSiteStatus } from 'calypso/state/staging-site/constants';
import { getStagingSiteStatus } from 'calypso/state/staging-site/selectors';
import { showSitesPage } from '../sites-dashboard';
import { SiteStatus } from '../sites-dataviews/sites-site-status';
import {
	FEATURE_TO_ROUTE_MAP,
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_OVERVIEW,
	DOTCOM_MONITORING,
	DOTCOM_SITE_PERFORMANCE,
	DOTCOM_LOGS_PHP,
	DOTCOM_LOGS_WEB,
	DOTCOM_GITHUB_DEPLOYMENTS,
	DOTCOM_HOSTING_FEATURES,
	DOTCOM_STAGING_SITE,
	OVERVIEW,
	MARKETING_TOOLS,
	MARKETING_CONNECTIONS,
	MARKETING_TRAFFIC,
	MARKETING_SHARING,
	SETTINGS_SITE,
	SETTINGS_ADMINISTRATION,
	SETTINGS_ADMINISTRATION_RESET_SITE,
	SETTINGS_ADMINISTRATION_TRANSFER_SITE,
	SETTINGS_ADMINISTRATION_DELETE_SITE,
	SETTINGS_CACHING,
	SETTINGS_WEB_SERVER,
	TOOLS,
	TOOLS_STAGING_SITE,
	TOOLS_DEPLOYMENTS,
	TOOLS_MONITORING,
	TOOLS_LOGS_PHP,
	TOOLS_LOGS_WEB,
	TOOLS_SFTP_SSH,
	TOOLS_DATABASE,
} from './constants';
import PreviewPaneHeaderButtons from './preview-pane-header-buttons';
import SiteEnvironmentSwitcher from './site-environment-switcher';
import type {
	ItemData,
	FeaturePreviewInterface,
} from 'calypso/layout/hosting-dashboard/item-view/types';

interface Props {
	site: SiteExcerptData;
	selectedSiteFeature: string;
	selectedSiteFeaturePreview: React.ReactNode;
	closeSitePreviewPane: () => void;
	changeSitePreviewPane: ( siteId: number ) => void;
}

const OVERLAY_MODAL_SELECTORS = [
	'body.modal-open',
	'#wpnc-panel.wpnt-open',
	'div.help-center__container:not(.is-minimized)',
];

const DotcomPreviewPane = ( {
	site,
	selectedSiteFeature,
	selectedSiteFeaturePreview,
	closeSitePreviewPane,
	changeSitePreviewPane,
}: Props ) => {
	const { __ } = useI18n();
	const hasEnTranslation = useHasEnTranslation();

	const isAtomicSite = !! site.is_wpcom_atomic || !! site.is_wpcom_staging_site;
	const isSimpleSite = ! site.jetpack && ! site.is_wpcom_atomic;
	const isPlanExpired = !! site.plan?.expired;
	const isMigrationPending = getMigrationStatus( site ) === 'pending';

	const features: FeaturePreviewInterface[] = useMemo( () => {
		const isActiveAtomicSite = isAtomicSite && ! isPlanExpired;
		const siteFeatures = [
			{
				label: __( 'Overview' ),
				enabled: ! config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [ DOTCOM_OVERVIEW ],
			},
			{
				label: __( 'Overview' ),
				enabled: config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [ OVERVIEW ],
			},
			{
				label: (
					<span>
						{ hasEnTranslation( 'Hosting Features' )
							? __( 'Hosting Features' )
							: __( 'Dev Tools' ) }
						<HostingFeaturesIcon />
					</span>
				),
				enabled:
					( isSimpleSite || isPlanExpired ) && ! config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [ DOTCOM_HOSTING_FEATURES ],
			},
			{
				label: __( 'Deployments' ),
				enabled: isActiveAtomicSite && ! config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [ DOTCOM_GITHUB_DEPLOYMENTS ],
			},
			{
				label: __( 'Monitoring' ),
				enabled: isActiveAtomicSite && ! config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [ DOTCOM_MONITORING ],
			},
			{
				label: __( 'Performance' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_SITE_PERFORMANCE ],
			},
			{
				label: __( 'Logs' ),
				enabled: isActiveAtomicSite && ! config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [ DOTCOM_LOGS_PHP, DOTCOM_LOGS_WEB ],
			},
			{
				label: __( 'Staging Site' ),
				enabled: isActiveAtomicSite && ! config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [ DOTCOM_STAGING_SITE ],
			},
			{
				label: __( 'Marketing' ),
				enabled: config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [
					MARKETING_TOOLS,
					MARKETING_CONNECTIONS,
					MARKETING_TRAFFIC,
					MARKETING_SHARING,
				],
			},
			{
				label: __( 'Advanced Tools' ),
				enabled:
					areHostingFeaturesSupported( site ) && config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [
					TOOLS_STAGING_SITE,
					TOOLS_DEPLOYMENTS,
					TOOLS_MONITORING,
					TOOLS_LOGS_PHP,
					TOOLS_LOGS_WEB,
					TOOLS_SFTP_SSH,
					TOOLS_DATABASE,
				],
			},
			{
				label: (
					<span>
						{ __( 'Advanced Tools' ) }
						<HostingFeaturesIcon />
					</span>
				),
				enabled:
					! areHostingFeaturesSupported( site ) && config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [ TOOLS ],
			},
			{
				label: __( 'Settings' ),
				enabled: config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [
					SETTINGS_SITE,
					SETTINGS_ADMINISTRATION,
					SETTINGS_ADMINISTRATION_RESET_SITE,
					SETTINGS_ADMINISTRATION_TRANSFER_SITE,
					SETTINGS_ADMINISTRATION_DELETE_SITE,
					SETTINGS_CACHING,
					SETTINGS_WEB_SERVER,
				],
			},
			{
				label: hasEnTranslation( 'Server Settings' )
					? __( 'Server Settings' )
					: __( 'Server Config' ),
				enabled: isActiveAtomicSite && ! config.isEnabled( 'untangling/hosting-menu' ),
				featureIds: [ DOTCOM_HOSTING_CONFIG ],
			},
		];

		return siteFeatures.map( ( { label, enabled, featureIds } ) => {
			const selected = enabled && featureIds.includes( selectedSiteFeature );
			const defaultFeatureId = featureIds[ 0 ];
			return {
				id: defaultFeatureId,
				tab: {
					label,
					visible: enabled,
					selected,
					onTabClick: () => {
						if ( enabled && ! selected ) {
							showSitesPage(
								`/${ FEATURE_TO_ROUTE_MAP[ defaultFeatureId ].replace( ':site', site.slug ) }`
							);
						}
					},
				},
				enabled,
				preview: enabled ? selectedSiteFeaturePreview : null,
			};
		} );
	}, [
		__,
		site,
		hasEnTranslation,
		selectedSiteFeature,
		selectedSiteFeaturePreview,
		isSimpleSite,
		isPlanExpired,
		isAtomicSite,
	] );

	const itemData: ItemData = {
		title: isMigrationPending ? __( 'Incoming Migration' ) : site.title,
		subtitle: site.slug,
		url: site.URL,
		blogId: site.ID,
		isDotcomSite: site.is_wpcom_atomic || site.is_wpcom_staging_site,
		adminUrl: site.options?.admin_url || `${ site.URL }/wp-admin`,
		withIcon: true,
	};

	useEffect( () => {
		const handleKeydown = ( e: KeyboardEvent ) => {
			if ( e.key !== 'Escape' ) {
				return;
			}

			if ( document.querySelector( OVERLAY_MODAL_SELECTORS.join( ',' ) ) ) {
				return;
			}

			closeSitePreviewPane();
		};

		document.addEventListener( 'keydown', handleKeydown, true );
		return () => {
			document.removeEventListener( 'keydown', handleKeydown, true );
		};
	}, [ closeSitePreviewPane ] );

	const { data: stagingSites } = useStagingSite( site.ID, {
		enabled: ! site.is_wpcom_staging_site && site.is_wpcom_atomic,
	} );

	if ( site.options && site.is_wpcom_atomic ) {
		site.options.wpcom_staging_blog_ids =
			stagingSites?.map( ( stagingSite ) => stagingSite.id ) ?? [];
	}

	const stagingStatus = useSelector( ( state ) => getStagingSiteStatus( state, site.ID ) );
	const isStagingStatusFinished =
		stagingStatus === StagingSiteStatus.COMPLETE ||
		stagingStatus === StagingSiteStatus.NONE ||
		stagingStatus === StagingSiteStatus.UNSET;

	return (
		<ItemView
			itemData={ itemData }
			closeItemView={ closeSitePreviewPane }
			features={ features }
			className={ site.is_wpcom_staging_site ? 'is-staging-site' : '' }
			enforceTabsView
			itemViewHeaderExtraProps={ {
				externalIconSize: 16,
				siteIconFallback: isMigrationPending ? 'migration' : 'first-grapheme',
				headerButtons: PreviewPaneHeaderButtons,
				subtitleExtra: () => {
					if ( isMigrationPending ) {
						return <SiteStatus site={ site } />;
					}

					if ( site.is_wpcom_staging_site || isStagingStatusFinished ) {
						return <SiteEnvironmentSwitcher onChange={ changeSitePreviewPane } site={ site } />;
					}
				},
			} }
		/>
	);
};

export default DotcomPreviewPane;
