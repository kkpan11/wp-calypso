import { useTranslate } from 'i18n-calypso';
import { Metrics, PerformanceMetricsHistory } from 'calypso/data/site-profiler/types';
import {
	metricsNames,
	metricsTresholds,
	mapThresholdsToStatus,
	metricValuations,
} from 'calypso/performance-profiler/utils/metrics';
import HistoryChart from '../charts/history-chart';
import { MetricScale } from '../metric-scale';
import { StatusIndicator } from '../status-indicator';

type CoreWebVitalsDetailsProps = Record< Metrics, number > & {
	history: PerformanceMetricsHistory;
	activeTab: Metrics | null;
};

export const CoreWebVitalsDetails: React.FC< CoreWebVitalsDetailsProps > = ( {
	activeTab,
	history,
	...metrics
} ) => {
	const translate = useTranslate();

	if ( ! activeTab ) {
		return null;
	}

	const { displayName } = metricsNames[ activeTab ];
	const value = metrics[ activeTab ];
	const valuation = mapThresholdsToStatus( activeTab, value );

	const { good, needsImprovement } = metricsTresholds[ activeTab ];

	const formatUnit = ( value: number ) => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return +( value / 1000 ).toFixed( 2 );
		}
		return value;
	};

	const displayUnit = () => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return translate( 's', { comment: 'Used for displaying a time range in seconds, eg. 1-2s' } );
		}
		if ( [ 'inp', 'tbt' ].includes( activeTab ) ) {
			return translate( 'ms', {
				comment: 'Used for displaying a range in milliseconds, eg. 100-200ms',
			} );
		}
		return '';
	};

	let metricsData: number[] = history?.metrics[ activeTab ] ?? [];
	let dates = history?.collection_period ?? [];

	// last 8 weeks only
	metricsData = metricsData.slice( -8 );
	dates = dates.slice( -8 );

	// the comparison is inverse here because the last value is the most recent
	const positiveTendency = metricsData[ metricsData.length - 1 ] < metricsData[ 0 ];

	const dataAvailable = metricsData.length > 0 && metricsData.some( ( item ) => item !== null );
	const historicalData = metricsData.map( ( item, index ) => {
		let formattedDate: unknown;
		const date = dates[ index ];
		if ( 'string' === typeof date ) {
			formattedDate = date;
		} else {
			const { year, month, day } = date;
			formattedDate = `${ year }-${ month }-${ day }`;
		}

		return {
			date: formattedDate,
			value: formatUnit( item ),
		};
	} );

	return (
		<div className="core-web-vitals-display__details">
			<div className="core-web-vitals-display__description">
				<span className="core-web-vitals-display__description-subheading">
					{ metricValuations[ activeTab ][ valuation ] }
				</span>
				<MetricScale metricName={ activeTab } value={ value } valuation={ valuation } />
				<div className="core-web-vitals-display__ranges">
					<div className="range">
						<StatusIndicator speed="good" />
						<div className="range-description">
							<div className="range-heading">{ translate( 'Fast' ) }</div>
							<div className="range-subheading">
								{ translate( '0–%(to)s%(unit)s', {
									args: { to: formatUnit( good ), unit: displayUnit() },
									comment: 'Displaying a time range, eg. 0-1s',
								} ) }
							</div>
						</div>
					</div>
					<div className="range">
						<StatusIndicator speed="needsImprovement" />
						<div className="range-description">
							<div className="range-heading">{ translate( 'Moderate' ) }</div>
							<div className="range-subheading">
								{ translate( '%(from)s–%(to)s%(unit)s', {
									args: {
										from: formatUnit( good ),
										to: formatUnit( needsImprovement ),
										unit: displayUnit(),
									},
									comment: 'Displaying a time range, eg. 2-3s',
								} ) }
							</div>
						</div>
					</div>
					<div className="range">
						<StatusIndicator speed="bad" />
						<div className="range-description">
							<div className="range-heading">{ translate( 'Slow' ) }</div>
							<div className="range-subheading">
								{ translate( '>%(from)s%(unit)s', {
									args: {
										from: formatUnit( needsImprovement ),
										unit: displayUnit(),
									},
									comment: 'Displaying a time range, eg. >2s',
								} ) }
							</div>
						</div>
					</div>
				</div>
				<span className="core-web-vitals-display__description-subheading">
					{ metricValuations[ activeTab ].heading }&nbsp;
				</span>
				<span className="core-web-vitals-display__description-aka">
					{ metricValuations[ activeTab ].aka }
				</span>
				<p>
					{ metricValuations[ activeTab ].explanation }
					&nbsp;
					<a href={ `https://web.dev/articles/${ activeTab }` }>{ translate( 'Learn more ↗' ) }</a>
				</p>
			</div>
			<div className="core-web-vitals-display__history-graph">
				{ dataAvailable && (
					<span className="core-web-vitals-display__description-subheading">
						{ positiveTendency
							? translate( '%s has improved over the past eight weeks', {
									args: [ displayName ],
							  } )
							: translate( '%s has declined over the past eight weeks', {
									args: [ displayName ],
							  } ) }
					</span>
				) }
				<HistoryChart
					data={ dataAvailable && historicalData }
					range={ [
						formatUnit( metricsTresholds[ activeTab ].good ),
						formatUnit( metricsTresholds[ activeTab ].needsImprovement ),
					] }
					height={ 300 }
				/>
			</div>
		</div>
	);
};
