import React from 'react';
import { SiteFaviconFallback } from 'calypso/blocks/site-favicon';

export interface FeaturePreviewInterface {
	id: string;
	tab: FeatureTabInterface;
	preview?: React.ReactNode;
	enabled?: boolean;
}

export interface FeatureTabInterface {
	label: string | React.ReactNode;
	countValue?: number;
	countColor?: string;
	selected?: boolean;
	visible?: boolean;
	onTabClick?: () => void;
}

export interface ItemData {
	title: string;
	subtitle: string | React.ReactNode;
	url?: string;
	icon?: string;
	color?: string;
	blogId?: number;
	isDotcomSite?: boolean;
	adminUrl?: string;
	withIcon?: boolean;
	hideEnvDataInHeader?: boolean;
}

export interface ItemViewProps {
	itemData: ItemData;
	closeItemView?: () => void;
	selectedFeatureId?: string;
	features?: FeaturePreviewInterface[];
	className?: string;
	isSmallScreen?: boolean;
	hasError?: boolean;
	addTourDetails?: { id: string; tourId: string };
	itemViewHeaderExtraProps?: ItemViewHeaderExtraProps;
	hideNavIfSingleTab?: boolean;
	enforceTabsView?: boolean;
	hideHeader?: boolean;
}

export interface ItemViewHeaderExtraProps {
	externalIconSize?: number;
	siteIconFallback?: SiteFaviconFallback;
	headerButtons?: React.ComponentType< {
		focusRef: React.RefObject< HTMLButtonElement >;
		itemData: ItemData;
		closeSitePreviewPane: () => void;
	} >;
	subtitleExtra?: string | React.ComponentType;
}
