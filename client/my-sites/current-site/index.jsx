import { isEnabled } from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import Site from 'calypso/blocks/site';
import AsyncLoad from 'calypso/components/async-load';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { useSelector } from 'calypso/state';
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
import { hasAllSitesList } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

function CurrentSite( { forceAllSitesView } ) {
	const translate = useTranslate();
	const anySiteSelected = useSelector( getSelectedOrAllSites );
	const hasAllSites = useSelector( hasAllSitesList );
	const currentlySelectedSite = useSelector( getSelectedSite );
	const selectedSite = forceAllSitesView ? null : currentlySelectedSite;

	if ( ! anySiteSelected.length || ( ! selectedSite && ! hasAllSites ) ) {
		const hasNoSites = hasAllSites && ! anySiteSelected.length;
		/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/anchor-is-valid */
		return (
			<Card
				className={ clsx( 'current-site', {
					'is-no-sites': hasNoSites,
					'is-loading': ! hasAllSites,
				} ) }
			>
				<div className="site">
					<a className="site__content">
						<div className="site-icon" />
						<div className="site__info">
							<span className="site__title">
								{ hasNoSites ? translate( 'No Sites' ) : translate( 'Loading My Sites…' ) }
							</span>
						</div>
					</a>
				</div>
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace, jsx-a11y/anchor-is-valid */
	}

	return (
		<Card className="current-site">
			<div role="button" tabIndex="0" aria-hidden="true" onClick={ undefined }>
				{ selectedSite && (
					<div>
						<Site site={ selectedSite } homeLink />
					</div>
				) }
				{ selectedSite && isEnabled( 'current-site/domain-warning' ) && (
					<AsyncLoad require="calypso/my-sites/current-site/domain-warnings" placeholder={ null } />
				) }
				{ selectedSite && isEnabled( 'current-site/stale-cart-notice' ) && (
					<CalypsoShoppingCartProvider>
						<AsyncLoad
							require="calypso/my-sites/current-site/stale-cart-items-notice"
							placeholder={ null }
						/>
					</CalypsoShoppingCartProvider>
				) }
				{ selectedSite && isEnabled( 'current-site/notice' ) && (
					<AsyncLoad
						require="calypso/my-sites/current-site/notice"
						placeholder={ null }
						site={ selectedSite }
					/>
				) }
			</div>
		</Card>
	);
}

export default CurrentSite;
