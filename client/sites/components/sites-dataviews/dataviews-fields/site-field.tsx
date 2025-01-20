import { ListTile, Button } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import { navigate } from 'calypso/lib/navigate';
import { isP2Theme } from 'calypso/lib/site/utils';
import SitesMigrationTrialBadge from 'calypso/sites-dashboard/components/sites-migration-trial-badge';
import SitesP2Badge from 'calypso/sites-dashboard/components/sites-p2-badge';
import { SiteName } from 'calypso/sites-dashboard/components/sites-site-name';
import { Truncated } from 'calypso/sites-dashboard/components/sites-site-url';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';
import {
	displaySiteUrl,
	isNotAtomicJetpack,
	getMigrationStatus,
	isStagingSite,
	isDisconnectedJetpackAndNotAtomic,
} from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import type { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
	openSitePreviewPane?: (
		site: SiteExcerptData,
		source: 'site_field' | 'action' | 'list_row_click' | 'environment_switcher',
		openInNewTab?: boolean
	) => void;
};

const SiteListTile = styled( ListTile )`
	gap: 0;
	margin-inline-end: 0;
	width: 280px;
	// Position the item at the top to align with Core, reverting ListTile's default centering.
	align-items: revert;

	.preview-hidden & {
		gap: 12px;
		max-width: 500px;
		width: 100%;
		/*
		 * Ensures the row fits within the device width on mobile in most cases,
		 * as it's not apparent to users that they can scroll horizontally.
		*/
		@media ( max-width: 480px ) {
			width: 250px;
		}
	}
`;

const ListTileTitle = styled.div`
	display: flex;
	align-items: center;
`;

const SiteField = ( { site, openSitePreviewPane }: Props ) => {
	const { __ } = useI18n();

	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	const title = __( 'View Site Details' );
	const { adminUrl } = useSiteAdminInterfaceData( site.ID );

	const isP2Site = site.options?.theme_slug && isP2Theme( site.options?.theme_slug );
	const isWpcomStagingSite = isStagingSite( site );
	const isTrialSitePlan = useSelector( ( state ) => isTrialSite( state, site.ID ) );

	const isAdmin = useSelector( ( state ) => canCurrentUser( state, site.ID, 'manage_options' ) );

	const onSiteClick = ( event: React.MouseEvent ) => {
		event.preventDefault();

		let openInNewTab = false;
		if ( event.ctrlKey || event.metaKey ) {
			openInNewTab = true;
		}
		// Support middle click to open in new tab
		if ( event.button === 1 ) {
			openInNewTab = true;
		}

		if (
			isAdmin &&
			! isP2Site &&
			! isNotAtomicJetpack( site ) &&
			! isDisconnectedJetpackAndNotAtomic( site )
		) {
			openSitePreviewPane && openSitePreviewPane( site, 'site_field', openInNewTab );
		} else {
			navigate( adminUrl, openInNewTab );
		}
	};

	const isMigrationPending = getMigrationStatus( site ) === 'pending';
	const siteTitle = isMigrationPending ? translate( 'Incoming Migration' ) : site.title;

	return (
		<Button
			className="sites-dataviews__site"
			onClick={ onSiteClick }
			onAuxClick={ onSiteClick }
			borderless
			disabled={ site.is_deleted }
		>
			<SiteListTile
				contentClassName={ clsx(
					'sites-dataviews__site-name',
					css`
						min-width: 0;
						text-align: start;
					`
				) }
				title={
					<ListTileTitle>
						<SiteName className="sites-dataviews__site-title" as="div" title={ title }>
							<Truncated>{ siteTitle }</Truncated>
						</SiteName>
						{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
						{ isWpcomStagingSite && <SitesStagingBadge>{ __( 'Staging' ) }</SitesStagingBadge> }
						{ isTrialSitePlan && (
							<SitesMigrationTrialBadge>{ __( 'Trial' ) }</SitesMigrationTrialBadge>
						) }
					</ListTileTitle>
				}
				subtitle={
					<div className="sites-dataviews__site-urls">
						<Truncated className="sites-dataviews__site-url">
							{ displaySiteUrl( siteUrl ) }
						</Truncated>
					</div>
				}
			/>
		</Button>
	);
};

export default SiteField;
