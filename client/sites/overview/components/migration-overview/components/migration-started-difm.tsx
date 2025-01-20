import { globe, group, Icon, scheduled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { Container, Header } from './layout';
import type { SiteDetails } from '@automattic/data-stores';

export const MigrationStartedDIFM = ( { site }: { site?: SiteDetails } ) => {
	const translate = useTranslate();
	const migrationSourceSiteDomain = site?.options?.migration_source_site_domain
		? site?.options?.migration_source_site_domain?.replace( /^https?:\/\/|\/+$/g, '' )
		: translate( 'your site' );

	const title = translate( 'Your migration is underway' );
	const subTitle = translate(
		"Sit back as {{strong}}%(siteName)s{{/strong}} transfers to its new home. Here's what you can expect.",
		{
			components: { strong: <strong /> },
			args: { siteName: migrationSourceSiteDomain },
		}
	) as string;

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />
			<div className="migration-started-difm">
				<h2 className="migration-started-difm__title">{ translate( 'What to expect' ) }</h2>
				<ul className="migration-started-difm__list">
					<li className="migration-started-difm__item">
						<div className="migration-started-difm__icon-wrapper">
							<Icon icon={ group } className="migration-started-difm__icon" size={ 30 } />
						</div>
						<span>
							{ translate(
								"We'll bring over a copy of your site, without affecting the current live version."
							) }
						</span>
					</li>
					<li className="migration-started-difm__item">
						<div className="migration-started-difm__icon-wrapper">
							<Icon icon={ scheduled } className="migration-started-difm__icon" size={ 30 } />
						</div>
						<span>
							{ translate(
								"You'll get an update on the progress of your migration within 2-3 business days."
							) }
						</span>
					</li>
					<li className="migration-started-difm__item">
						<div className="migration-started-difm__icon-wrapper">
							<Icon icon={ globe } className="migration-started-difm__icon" size={ 30 } />
						</div>
						<span>
							{ translate(
								"We'll help you switch your domain over after the migration's completed."
							) }
						</span>
					</li>
				</ul>
			</div>
		</Container>
	);
};
