import page, { Context as PageJSContext } from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import HostingFeatures from 'calypso/sites/hosting-features/components/hosting-features';
import { SiteLogs } from 'calypso/sites/tools/logs';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getRouteFromContext } from 'calypso/utils';
import { SidebarItem, Sidebar, PanelWithSidebar } from '../components/panel-sidebar';
import { areHostingFeaturesSupported } from '../hosting-features/features';
import Database from './database/page';
import {
	DeploymentCreation,
	DeploymentManagement,
	DeploymentRunLogs,
	Deployments,
} from './deployments';
import { indexPage } from './deployments/routes';
import Monitoring from './monitoring';
import useSftpSshSettingTitle from './sftp-ssh/hooks/use-sftp-ssh-setting-title';
import SftpSsh from './sftp-ssh/page';
import StagingSite from './staging-site';

export function ToolsSidebar() {
	const slug = useSelector( getSelectedSiteSlug );

	const sftpSshTitle = useSftpSshSettingTitle();

	return (
		<Sidebar>
			<SidebarItem href={ `/sites/tools/staging-site/${ slug }` }>
				{ __( 'Staging site' ) }
			</SidebarItem>
			<SidebarItem href={ `/sites/tools/deployments/${ slug }` }>
				{ __( 'Deployments' ) }
			</SidebarItem>
			<SidebarItem href={ `/sites/tools/monitoring/${ slug }` }>{ __( 'Monitoring' ) }</SidebarItem>
			<SidebarItem href={ `/sites/tools/logs/${ slug }` }>{ __( 'Logs' ) }</SidebarItem>
			<SidebarItem href={ `/sites/tools/sftp-ssh/${ slug }` }>{ sftpSshTitle }</SidebarItem>
			<SidebarItem href={ `/sites/tools/database/${ slug }` }>{ __( 'Database' ) }</SidebarItem>
		</Sidebar>
	);
}

export function tools( context: PageJSContext, next: () => void ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	if ( areHostingFeaturesSupported( site ) ) {
		// Redirect to the first subtab
		return page.redirect( `/sites/tools/staging-site/${ site?.slug }` );
	}

	context.primary = (
		<>
			<PageViewTracker title="Sites > Advanced Tools" path={ getRouteFromContext( context ) } />
			<HostingFeatures showAsTools />
		</>
	);
	next();
}

export function stagingSite( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Advanced Tools > Staging site"
				path={ getRouteFromContext( context ) }
			/>
			<ToolsSidebar />
			<StagingSite />
		</PanelWithSidebar>
	);
	next();
}

export function deployments( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Advanced Tools > Deployments"
				path={ getRouteFromContext( context ) }
			/>
			<ToolsSidebar />
			<Deployments />
		</PanelWithSidebar>
	);
	next();
}

export function deploymentCreation( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Advanced Tools > Deployments > Create"
				path={ getRouteFromContext( context ) }
			/>
			<ToolsSidebar />
			<DeploymentCreation />
		</PanelWithSidebar>
	);
	next();
}

export function deploymentManagement( context: PageJSContext, next: () => void ) {
	const codeDeploymentId = parseInt( context.params.deploymentId, 10 ) || null;
	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state );

	if ( ! codeDeploymentId ) {
		return context.page.replace( indexPage( siteSlug! ) );
	}

	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Advanced Tools > Deployments > Manage"
				path={ getRouteFromContext( context ) }
			/>
			<ToolsSidebar />
			<DeploymentManagement codeDeploymentId={ codeDeploymentId } />
		</PanelWithSidebar>
	);
	next();
}

export function deploymentRunLogs( context: PageJSContext, next: () => void ) {
	const codeDeploymentId = parseInt( context.params.deploymentId, 10 ) || null;
	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state );

	if ( ! codeDeploymentId ) {
		return context.page.replace( indexPage( siteSlug! ) );
	}

	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Advanced Tools > Deployments > Run logs"
				path={ getRouteFromContext( context ) }
			/>
			<ToolsSidebar />
			<DeploymentRunLogs codeDeploymentId={ codeDeploymentId } />
		</PanelWithSidebar>
	);
	next();
}

export function monitoring( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Advanced Tools > Monitoring"
				path={ getRouteFromContext( context ) }
			/>
			<ToolsSidebar />
			<Monitoring />
		</PanelWithSidebar>
	);
	next();
}

export function phpErrorLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Advanced Tools > Logs > PHP"
				path={ getRouteFromContext( context ) }
			/>
			<ToolsSidebar />
			<SiteLogs logType="php" />
		</PanelWithSidebar>
	);
	next();
}

export function webServerLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Advanced Tools > Logs > Web"
				path={ getRouteFromContext( context ) }
			/>
			<ToolsSidebar />
			<SiteLogs logType="web" />
		</PanelWithSidebar>
	);
	next();
}

export function sftpSsh( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Advanced Tools > SFTP/SSH"
				path={ getRouteFromContext( context ) }
			/>
			<ToolsSidebar />
			<SftpSsh />
		</PanelWithSidebar>
	);
	next();
}

export function database( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Advanced Tools > Database"
				path={ getRouteFromContext( context ) }
			/>
			<ToolsSidebar />
			<Database />
		</PanelWithSidebar>
	);
	next();
}
