import { Button, Gridicon } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, ReactNode, useEffect } from 'react';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { Referral, ReferralInvoice } from '../types';
import CommissionsColumn from './commissions-column';
import SubscriptionStatus from './subscription-status';
import type { Field } from '@wordpress/dataviews';

import './style.scss';

interface Props {
	referrals: Referral[];
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
	referralInvoices: ReferralInvoice[];
}

export default function ReferralList( {
	referrals,
	dataViewsState,
	setDataViewsState,
	referralInvoices,
}: Props ) {
	const isDesktop = useDesktopBreakpoint();
	const translate = useTranslate();
	const dispatch = useDispatch();

	const openSitePreviewPane = useCallback(
		( referral: Referral ) => {
			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: referral,
				type: DATAVIEWS_LIST,
			} ) );
			dispatch( recordTracksEvent( 'calypso_a4a_referrals_list_view_details_click' ) );
		},
		[ dispatch, setDataViewsState ]
	);

	const fields: Field< any >[] = useMemo(
		() =>
			dataViewsState.selectedItem || ! isDesktop
				? [
						// Show the client column as a button on mobile
						{
							id: 'client',
							label: translate( 'Client' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => (
								<Button
									className="view-details-button client-email-button"
									data-client-id={ item.client.id }
									onClick={ () => openSitePreviewPane( item ) }
									borderless
								>
									{ item.client.email }
								</Button>
							),
							width: '100%',
							enableHiding: false,
							enableSorting: false,
						},
						// Only show the actions column only on mobile
						...( ! dataViewsState.selectedItem
							? [
									{
										id: 'actions',
										label: '',
										render: ( { item }: { item: Referral } ) => (
											<div>
												<Button
													className="view-details-button"
													onClick={ () => openSitePreviewPane( item ) }
													borderless
												>
													<Gridicon icon="chevron-right" />
												</Button>
											</div>
										),
										enableHiding: false,
										enableSorting: false,
									},
							  ]
							: [] ),
				  ]
				: [
						{
							id: 'client',
							label: translate( 'Client' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => (
								<Button
									className="view-details-button"
									data-client-id={ item.client.id }
									onClick={ () => openSitePreviewPane( item ) }
									borderless
								>
									{ item.client.email }
								</Button>
							),
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'pending-orders',
							label: translate( 'Pending Orders' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode =>
								item.referralStatuses.filter( ( status ) => status === 'pending' ).length,
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'completed-orders',
							label: translate( 'Completed Orders' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode =>
								item.referralStatuses.filter( ( status ) => status === 'active' ).length,
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'commissions',
							label: translate( 'Commissions' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => {
								const clientReferralInvoices = referralInvoices.filter(
									( invoice ) => invoice.clientId === item.client.id
								);
								return (
									<CommissionsColumn
										referral={ item }
										referralInvoices={ clientReferralInvoices }
									/>
								);
							},
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'subscription-status',
							label: translate( 'Subscription Status' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => (
								<SubscriptionStatus item={ item } />
							),
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'actions',
							label: translate( 'Actions' ).toUpperCase(),
							render: ( { item }: { item: Referral } ) => (
								<div>
									<Button
										className="view-details-button action-button"
										onClick={ () => openSitePreviewPane( item ) }
										borderless
									>
										<Gridicon icon="chevron-right" />
									</Button>
								</div>
							),
							enableHiding: false,
							enableSorting: false,
						},
				  ],
		[ dataViewsState.selectedItem, isDesktop, openSitePreviewPane, referralInvoices, translate ]
	);

	useEffect( () => {
		// If the user clicks on a row, open the preview pane by triggering the View details button click.
		const handleRowClick = ( event: Event ) => {
			const target = event.target as HTMLElement;
			const row = target.closest(
				'.dataviews-view-table__row, li:has(.dataviews-view-list__item)'
			);

			if ( row ) {
				const isButtonOrLink = target.closest( 'button, a' );
				if ( ! isButtonOrLink ) {
					const button = row.querySelector( '.view-details-button' ) as HTMLButtonElement;
					if ( button ) {
						button.click();
					}
				}
			}
		};

		const rowsContainer = document.querySelector( '.dataviews-view-table, .dataviews-view-list' );

		if ( rowsContainer ) {
			rowsContainer.addEventListener( 'click', handleRowClick as EventListener );
		}

		// We need to trigger the click event on the View details button when the selected item changes to ensure highlighted row is correct.
		if (
			rowsContainer?.classList.contains( 'dataviews-view-list' ) &&
			dataViewsState?.selectedItem?.client_id
		) {
			const trigger: HTMLButtonElement | null = rowsContainer.querySelector(
				`li:not(.is-selected) .view-details-button[data-client-id='${ dataViewsState?.selectedItem?.client_id }']`
			);
			if ( trigger ) {
				trigger.click();
			}
		}

		return () => {
			if ( rowsContainer ) {
				rowsContainer.removeEventListener( 'click', handleRowClick as EventListener );
			}
		};
	}, [ dataViewsState ] );

	const { data: items, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( referrals, dataViewsState, fields );
	}, [ referrals, dataViewsState, fields ] );

	return (
		<div className="redesigned-a8c-table full-width">
			<ItemsDataViews
				data={ {
					items,
					getItemId: ( item: Referral ) => `${ item.client.id }`,
					onSelectionChange: ( data ) => {
						const referral = referrals.find( ( r ) => r.client.id === +data[ 0 ] );
						if ( referral ) {
							openSitePreviewPane( referral );
						}
					},
					pagination: paginationInfo,
					enableSearch: false,
					fields: fields,
					actions: [],
					setDataViewsState: setDataViewsState,
					dataViewsState: dataViewsState,
					defaultLayouts: { table: {} },
				} }
			/>
		</div>
	);
}
