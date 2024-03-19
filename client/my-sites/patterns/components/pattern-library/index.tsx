import page from '@automattic/calypso-router';
import { useLocale, addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import {
	Icon,
	starEmpty as iconStar,
	category as iconCategory,
	menu as iconMenu,
} from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import { PatternsCopyPasteInfo } from 'calypso/my-sites/patterns/components/copy-paste-info';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { PatternsHeader } from 'calypso/my-sites/patterns/components/header';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/controller';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import {
	usePatternSearchTerm,
	filterPatternsByTerm,
} from 'calypso/my-sites/patterns/hooks/use-pattern-search-term';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';
import {
	PatternTypeFilter,
	type CategoryGalleryFC,
	type Pattern,
	type PatternGalleryFC,
} from 'calypso/my-sites/patterns/types';

import './style.scss';

// We use this unstyled Emotion component simply to prevent errors related to the use of Emotion's
// `useCx` hook in `ToggleGroupControl`
const PatternLibraryBody = styled.div``;

function filterPatternsByType( patterns: Pattern[], type: PatternTypeFilter ) {
	return patterns.filter( ( pattern ) => {
		const categorySlugs = Object.keys( pattern.categories );
		const isPage = categorySlugs.includes( 'page' );

		return type === PatternTypeFilter.PAGES ? isPage : ! isPage;
	} );
}

const handleSettingView = ( value: 'grid' | 'list' ) => {
	const searchParams = new URLSearchParams( location.search );

	if ( value === 'grid' ) {
		searchParams.set( 'grid', '1' );
	} else {
		searchParams.delete( 'grid' );
	}

	const paramsString = searchParams.toString().length ? `?${ searchParams.toString() }` : '';
	page( location.pathname + paramsString );
};

type PatternLibraryProps = {
	category: string;
	categoryGallery: CategoryGalleryFC;
	isGridView?: boolean;
	patternGallery: PatternGalleryFC;
	patternTypeFilter: PatternTypeFilter;
	searchTerm?: string;
};

export const PatternLibrary = ( {
	category,
	categoryGallery: CategoryGallery,
	isGridView,
	patternGallery: PatternGallery,
	patternTypeFilter,
	searchTerm: urlQuerySearchTerm,
}: PatternLibraryProps ) => {
	const locale = useLocale();
	// Helps prevent resetting the search input if a search term was provided through the URL
	const isInitialRender = useRef( true );
	// Helps reset the search input when navigating between categories
	const [ searchFormKey, setSearchFormKey ] = useState( category );

	const [ searchTerm, setSearchTerm ] = usePatternSearchTerm( urlQuerySearchTerm ?? '' );
	const { data: categories } = usePatternCategories( locale );
	const { data: patterns = [] } = usePatterns( locale, category, {
		select( patterns ) {
			const patternsByType = filterPatternsByType( patterns, patternTypeFilter );
			return filterPatternsByTerm( patternsByType, searchTerm );
		},
	} );

	// Resets the search term when navigating from `/patterns?s=lorem` to `/patterns`
	useEffect( () => {
		if ( ! urlQuerySearchTerm ) {
			setSearchTerm( '' );
			setSearchFormKey( Math.random().toString() );
		}
	}, [ urlQuerySearchTerm ] );

	// Resets the search term whenever the category changes
	useEffect( () => {
		if ( isInitialRender.current ) {
			isInitialRender.current = false;
		} else {
			setSearchTerm( '' );
			setSearchFormKey( category );
		}
	}, [ category ] );

	const isHomePage = ! category && ! searchTerm;

	const categoryObject = categories?.find( ( { name } ) => name === category );

	const categoryNavList = categories?.map( ( category ) => {
		const patternTypeFilterFallback =
			category.pagePatternCount === 0 ? PatternTypeFilter.REGULAR : patternTypeFilter;

		return {
			id: category.name,
			label: category.label,
			link:
				getCategoryUrlPath( category.name, patternTypeFilterFallback, false ) +
				( isGridView ? '?grid=1' : '' ),
		};
	} );

	return (
		<>
			<DocumentHead title="WordPress Patterns - Category" />

			<PatternsHeader
				description={
					category
						? 'Introduce yourself or your brand to visitors.'
						: 'Hundreds of expertly designed, fully responsive patterns allow you to craft a beautiful site in minutes.'
				}
				key={ searchFormKey }
				initialSearchTerm={ searchTerm }
				onSearch={ ( query ) => {
					setSearchTerm( query );
				} }
				title={ category ? `${ category } patterns` : 'Build your perfect site with patterns' }
			/>

			{ ! isHomePage && categoryNavList && (
				<div className="pattern-library__pill-navigation">
					<CategoryPillNavigation
						selectedCategory={ category }
						buttons={ [
							{
								icon: <Icon icon={ iconStar } size={ 30 } />,
								label: 'Discover',
								link: addLocaleToPathLocaleInFront( '/patterns' ),
							},
							{
								icon: <Icon icon={ iconCategory } size={ 26 } />,
								label: 'All Categories',
								link: '/222',
							},
						] }
						list={ categoryNavList }
					/>
				</div>
			) }

			{ isHomePage && (
				<CategoryGallery
					title="Ship faster with patterns"
					description="Choose from a huge library of patterns to build any page you need."
					categories={ categories }
					patternTypeFilter={ PatternTypeFilter.REGULAR }
				/>
			) }

			{ ! isHomePage && (
				<PatternLibraryBody className="pattern-library">
					<div className="pattern-library__header">
						<h1 className="pattern-library__title">
							{ searchTerm ? `${ patterns.length } patterns` : 'Patterns' }
						</h1>

						{ category && (
							<ToggleGroupControl
								className="pattern-library__toggle--pattern-type"
								isBlock
								label=""
								onChange={ ( value ) => {
									const href = getCategoryUrlPath( category, value as PatternTypeFilter );
									page( href );
								} }
								value={ patternTypeFilter }
							>
								<ToggleGroupControlOption
									className="pattern-library__toggle-option"
									label="Patterns"
									value={ PatternTypeFilter.REGULAR }
								/>
								<ToggleGroupControlOption
									className="pattern-library__toggle-option"
									disabled={ categoryObject?.pagePatternCount === 0 }
									label="Page layouts"
									value={ PatternTypeFilter.PAGES }
								/>
							</ToggleGroupControl>
						) }

						<ToggleGroupControl
							className="pattern-library__toggle--view"
							label=""
							isBlock
							value={ isGridView ? 'grid' : 'list' }
						>
							<ToggleGroupControlOption
								className="pattern-library__toggle-option--list-view"
								label={ ( <Icon icon={ iconMenu } size={ 20 } /> ) as unknown as string }
								value="list"
								onClick={ () => handleSettingView( 'list' ) }
							/>
							<ToggleGroupControlOption
								className="pattern-library__toggle-option--grid-view"
								label={ ( <Icon icon={ iconCategory } size={ 20 } /> ) as unknown as string }
								value="grid"
								onClick={ () => handleSettingView( 'grid' ) }
							/>
						</ToggleGroupControl>
					</div>

					<PatternGallery patterns={ patterns } isGridView={ isGridView } />
				</PatternLibraryBody>
			) }

			{ isHomePage && <PatternsCopyPasteInfo /> }

			{ isHomePage && (
				<CategoryGallery
					title="Beautifully curated page layouts"
					description="Entire pages built of patterns, ready to be added to your site."
					categories={ categories?.filter( ( c ) => c.pagePatternCount ) }
					patternTypeFilter={ PatternTypeFilter.PAGES }
				/>
			) }

			<PatternsGetStarted />
		</>
	);
};