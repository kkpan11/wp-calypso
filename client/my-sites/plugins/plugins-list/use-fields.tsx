import { Button } from '@wordpress/components';
import { Operator } from '@wordpress/dataviews';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { PLUGINS_STATUS } from 'calypso/state/plugins/installed/status/constants';
import { Plugin } from 'calypso/state/plugins/installed/types';
import { PluginActions } from '../hooks/types';
import PluginActionStatus from '../plugin-management-v2/plugin-action-status';

export function useFields(
	bulkActionDialog: ( action: string, plugins: Array< Plugin > ) => void,
	openPluginSitesPane: ( plugin: Plugin ) => void,
	isListView: boolean
) {
	const dispatch = useDispatch();

	const trackPluginNameClick = ( item: Plugin ) => {
		dispatch(
			recordTracksEvent( 'calypso_plugins_manage_list_plugin_name_click', {
				plugin_slug: item.slug,
			} )
		);
	};

	const fields = useMemo(
		() => [
			{
				id: 'status',
				label: translate( 'Status' ),
				getValue: ( { item }: { item: Plugin } ) => {
					return item.status;
				},
				render: () => null,
				elements: [
					{
						value: PLUGINS_STATUS.ACTIVE,
						label: translate( 'Active' ),
					},
					{
						value: PLUGINS_STATUS.INACTIVE,
						label: translate( 'Inactive' ),
					},
					{
						value: PLUGINS_STATUS.UPDATE,
						label: translate( 'Needs update' ),
					},
				],
				filterBy: {
					operators: [ 'isAny' as Operator ],
					isPrimary: false,
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'icon',
				label: translate( 'Icon' ),
				render: ( { item }: { item: Plugin } ) => (
					<Button
						onClick={ () => {
							trackPluginNameClick( item );
							openPluginSitesPane( item );
						} }
						className="plugin-name-button"
					>
						<PluginIcon className="plugin-icon" image={ item.icon } size={ 52 } />
					</Button>
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plugins',
				label: translate( 'Installed Plugins' ),
				getValue: ( { item }: { item: Plugin } ) => item.name,
				enableGlobalSearch: true,
				render: ( { item }: { item: Plugin } ) => {
					let pluginActionStatus = null;

					if ( item.allStatuses?.length ) {
						pluginActionStatus = (
							<Button
								className="sites-manage-plugin-status-button"
								onClick={ () => {
									trackPluginNameClick( item );
									openPluginSitesPane( item );
								} }
							>
								<PluginActionStatus
									currentSiteStatuses={ item.allStatuses }
									selectedSite={ undefined }
								/>
							</Button>
						);
					}

					return (
						<>
							<Button
								onClick={ () => {
									trackPluginNameClick( item );
									openPluginSitesPane( item );
								} }
								className="plugin-name-button"
							>
								{ ! isListView && (
									<PluginIcon className="plugin-icon" image={ item.icon } size={ 35 } />
								) }
								{ item.name }
							</Button>
							{ pluginActionStatus }
						</>
					);
				},
				enableSorting: true,
			},
			{
				id: 'sites',
				label: translate( 'Sites' ),
				enableHiding: false,
				getValue: ( { item }: { item: Plugin } ) => {
					// Used exclusively for sorting
					return item.sites && Object.keys( item.sites ).length;
				},
				render: ( { item }: { item: Plugin } ) => {
					const numberOfSites = item.sites && Object.keys( item.sites ).length;
					return (
						<Button
							className="sites-manage-plugin-button"
							onClick={ () => {
								dispatch(
									recordTracksEvent( 'calypso_plugins_manage_list_plugin_sitecount_click', {
										plugin_slug: item.slug,
										site_count: numberOfSites,
									} )
								);

								openPluginSitesPane( item );
							} }
						>
							{ numberOfSites }
							{ isListView && ( numberOfSites > 1 ? translate( ' sites' ) : translate( ' site' ) ) }
						</Button>
					);
				},
			},
			{
				id: 'update',
				label: translate( 'Update available' ),
				getValue: ( { item }: { item: Plugin } ) => {
					// Used exclusively for sorting
					return item.status?.includes( PLUGINS_STATUS.UPDATE ) ? 'a' : 'b';
				},
				enableHiding: false,
				render: ( { item }: { item: Plugin } ) => {
					if ( item.status?.includes( PLUGINS_STATUS.UPDATE ) && item?.update?.new_version ) {
						return (
							<Button
								variant="secondary"
								onClick={ () => {
									dispatch(
										recordTracksEvent( 'calypso_plugins_manage_list_plugin_updateavailable_click', {
											plugin_slug: item.slug,
										} )
									);

									bulkActionDialog( PluginActions.UPDATE, [ item ] );
								} }
							>
								{ translate( 'Update to version %(version)s', {
									args: {
										version: item?.update?.new_version
											? item.update.new_version.split( '-' ).slice( 0, 2 ).join( '-' )
											: '',
									},
								} ) }
							</Button>
						);
					}
				},
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ bulkActionDialog, openPluginSitesPane, isListView ]
	);

	return fields;
}
