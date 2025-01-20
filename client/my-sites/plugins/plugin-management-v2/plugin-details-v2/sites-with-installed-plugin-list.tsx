import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, useCallback } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { DataViews } from 'calypso/components/dataviews';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PluginCommonAction from 'calypso/my-sites/plugins/plugin-management-v2/plugin-common/plugin-common-actions';
import PluginRowFormatter from 'calypso/my-sites/plugins/plugin-management-v2/plugin-row-formatter';
import { getSitesWithSecondarySites } from 'calypso/my-sites/plugins/plugin-management-v2/utils/get-sites-with-secondary-sites';
import { useDispatch, useSelector } from 'calypso/state';
import { updatePlugin } from 'calypso/state/plugins/installed/actions';
import { PluginSite } from 'calypso/state/plugins/installed/types';
import PluginManageConnection from '../plugin-manage-connection';
import PluginManageSubcription from '../plugin-manage-subscription';
import RemovePlugin from '../remove-plugin';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	sites: Array< SiteDetails | null | undefined >;
	selectedSite?: SiteDetails;
	isLoading: boolean;
	plugin: PluginComponentProps;
	isWpCom?: boolean;
}

export default function SitesWithInstalledPluginsList( { sites, plugin, isWpCom }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const compareBooleans =
		( fieldName: keyof PluginSite ) => ( a: SiteDetails, b: SiteDetails, direction: string ) => {
			const aValue = plugin.sites[ a.ID ][ fieldName ];
			const bValue = plugin.sites[ b.ID ][ fieldName ];
			if ( aValue === bValue ) {
				return 0;
			}
			if ( direction === 'asc' ) {
				return aValue ? 1 : -1;
			}
			return aValue ? -1 : 1;
		};

	const renderActions = useCallback(
		( site: SiteDetails ) => {
			const settingsLink = plugin?.action_links?.Settings ?? null;
			return (
				<>
					<RemovePlugin site={ site } plugin={ plugin } />
					<PluginManageConnection site={ site } plugin={ plugin } />
					{ isWpCom && (
						<>
							<PluginManageSubcription site={ site } plugin={ plugin } />
							{ settingsLink && (
								<PopoverMenuItem
									className="plugin-management-v2__actions"
									icon="cog"
									href={ settingsLink }
								>
									{ translate( 'Settings' ) }
								</PopoverMenuItem>
							) }
						</>
					) }
				</>
			);
		},
		[ plugin, isWpCom, translate ]
	);

	const dataViewsFields = useMemo(
		() => [
			{
				id: 'domain',
				label: translate( 'Site' ),
				getValue: ( { item }: { item: SiteDetails } ) => item.domain,
				render: ( { item }: { item: SiteDetails } ) => {
					return (
						<PluginRowFormatter
							item={ plugin }
							columnKey="site-name"
							selectedSite={ item }
							siteCount={ sites.length }
						/>
					);
				},
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'activate',
				label: translate( 'Active' ),
				getValue: ( { item }: { item: SiteDetails } ) => plugin.sites[ item.ID ].active,
				render: ( { item }: { item: SiteDetails } ) => {
					return (
						<PluginRowFormatter
							item={ plugin }
							columnKey="activate"
							selectedSite={ item }
							siteCount={ sites.length }
						/>
					);
				},
				enableHiding: false,
				enableSorting: true,
				sort: compareBooleans( 'active' ),
			},
			{
				id: 'autoupdate',
				label: translate( 'Autoupdate' ),
				getValue: ( { item }: { item: SiteDetails } ) => plugin.sites[ item.ID ].autoupdate,
				render: ( { item }: { item: SiteDetails } ) => {
					return (
						<PluginRowFormatter
							item={ plugin }
							columnKey="autoupdate"
							selectedSite={ item }
							siteCount={ sites.length }
						/>
					);
				},
				enableHiding: false,
				enableSorting: true,
				sort: compareBooleans( 'autoupdate' ),
			},
			{
				id: 'update',
				label: translate( 'Update' ),
				render: ( { item }: { item: SiteDetails } ) => {
					return (
						<PluginRowFormatter
							item={ plugin }
							columnKey="update"
							selectedSite={ item }
							siteCount={ sites.length }
							updatePlugin={ () => dispatch( updatePlugin( item.ID, plugin ) ) }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'actions',
				label: translate( 'Actions' ),
				render: ( { item }: { item: SiteDetails } ) => (
					<PluginCommonAction item={ item } renderActions={ renderActions } />
				),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate, plugin, sites.length, dispatch, renderActions ]
	);

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( () => ( {
		...initialDataViewsState,
		fields: [ 'domain', 'activate', 'autoupdate', 'update', 'actions' ],
		items: sites,
	} ) );

	const sitesWithSecondarySites = useSelector( ( state ) =>
		getSitesWithSecondarySites( state, sites )
	);

	if ( ! sitesWithSecondarySites?.length ) {
		return null;
	}

	const siteCount = sitesWithSecondarySites.length;
	const dataViewsSites = sitesWithSecondarySites
		.map( ( site ) => site.site )
		.filter( ( site ) => site && ! site.is_deleted );

	const { data, paginationInfo } = filterSortAndPaginate(
		dataViewsSites.filter( ( site ): site is SiteDetails => site !== null && site !== undefined ),
		dataViewsState,
		dataViewsFields
	);

	return (
		<div className="plugin-details-v2__sites-list">
			<div className="plugin-details-v2__title">
				{ translate(
					'Installed on %(count)d site',
					'Installed on %(count)d sites', // plural version of the string
					{
						count: siteCount,
						args: { count: siteCount },
					}
				) }
			</div>
			{ isWpCom && plugin.isMarketplaceProduct && <QueryUserPurchases /> }
			<DataViews
				fields={ dataViewsFields }
				data={ data }
				view={ dataViewsState }
				onChangeView={ setDataViewsState }
				paginationInfo={ paginationInfo }
				defaultLayouts={ { table: {} } }
				getItemId={ ( item ) => item.domain }
			/>
		</div>
	);
}
