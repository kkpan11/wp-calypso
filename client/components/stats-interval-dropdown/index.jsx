import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Dropdown } from '@wordpress/components';
import { check, Icon, chevronDown, lock } from '@wordpress/icons';
import clsx from 'clsx';
import { capitalize } from 'lodash';
import qs from 'qs';
import { useRef } from 'react';
import useOutsideClickCallback from 'calypso/lib/use-outside-click-callback';
import { useSelector } from 'calypso/state';
import getSiteId from 'calypso/state/sites/selectors/get-site-id';
import './style.scss';

const StatsIntervalDropdownListing = ( {
	selected,
	onSelection,
	intervals,
	onGatedHandler,
	onClickOutside,
} ) => {
	const ref = useRef( null );
	useOutsideClickCallback( ref, onClickOutside );

	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const isSelectedItem = ( interval ) => {
		return interval === selected;
	};

	const clickHandler = ( interval ) => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';

		if ( intervals[ interval ].isGated && onGatedHandler ) {
			const events = [
				{
					name: `${ event_from }_stats_interval_dropdown_listing_${ intervals[ interval ].id }_gated_clicked`,
				},
				{
					name: 'jetpack_stats_upsell_clicked',
					params: { stat_type: intervals[ interval ].statType, source: event_from },
				},
			];
			return onGatedHandler( events, event_from, intervals[ interval ].statType );
		}
		onSelection( interval );
	};

	return (
		<div className="stats-interval-dropdown-listing" ref={ ref }>
			<ul className="stats-interval-dropdown-listing__list" role="radiogroup">
				{ Object.keys( intervals ).map( ( intervalKey ) => {
					const interval = intervals[ intervalKey ];

					return (
						<li
							className={ clsx( 'stats-interval-dropdown-listing__interval', {
								[ 'is-selected' ]: isSelectedItem( intervalKey ),
							} ) }
							key={ intervalKey }
							role="none"
						>
							<Button
								role="radio"
								aria-checked={ isSelectedItem( intervalKey ) }
								onClick={ () => {
									clickHandler( intervalKey );
								} }
							>
								{ interval.label }
								{ isSelectedItem( intervalKey ) && <Icon icon={ check } /> }
								{ interval.isGated && <Icon icon={ lock } /> }
							</Button>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
};

const IntervalDropdown = ( { slug, period, queryParams, intervals, onGatedHandler } ) => {
	// New interval listing that preserves date range.
	// TODO: Figure out how to dismiss on select.

	const siteId = useSelector( ( state ) => getSiteId( state, slug ) );

	function generateNewLink( newPeriod ) {
		const newRangeQuery = qs.stringify( Object.assign( {}, queryParams, {} ), {
			addQueryPrefix: true,
		} );
		const url = `/stats/${ newPeriod }/${ slug }`;
		return `${ url }${ newRangeQuery }`;
	}

	function getDisplayLabel() {
		// If the period is not in the intervals list, capitalize it and show in the label - however user wouldn't be able to select it.
		// TODO: this is a temporary solution, we should remove this once we have all the intervals in the list.
		return intervals[ period ]?.label ?? `${ capitalize( period ) }s`;
	}

	function onSelectionHandler( interval ) {
		// Temporary fix to prevent selecting intervals when the applied interval is not in the list. E.g., Hour.
		// TODO: Remove the selection if the current applied interval is not in the list.
		if ( ! intervals[ period ] ) {
			return;
		}

		localStorage.setItem( `jetpack_stats_stored_period_${ siteId }`, interval );
		// Remove legacy item key.
		localStorage.removeItem( 'jetpack_stats_stored_period' );

		page( generateNewLink( interval ) );
	}

	// Check if the selected period is in the intervals list.
	const selectedPeriod = intervals[ period ];

	return selectedPeriod ? (
		<Dropdown
			className="stats-interval-dropdown"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button onClick={ onToggle } aria-expanded={ isOpen }>
					{ getDisplayLabel() }
					<Icon className="gridicon" icon={ chevronDown } />
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<div className="stats-interval-dropdown__container">
					<StatsIntervalDropdownListing
						selected={ period }
						onSelection={ onSelectionHandler }
						intervals={ intervals }
						onGatedHandler={ onGatedHandler }
						onClickOutside={ onClose }
					/>
				</div>
			) }
			focusOnMount={ false }
		/>
	) : (
		// TODO: Tweak the styles or move this to another place for better UX.
		<div className="stats-interval-display">
			<label>{ getDisplayLabel() }</label>
		</div>
	);
};

export default IntervalDropdown;
