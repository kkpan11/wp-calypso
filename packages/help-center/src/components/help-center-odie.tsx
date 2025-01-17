/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { Gridicon } from '@automattic/components';
import { OdieAssistant, useOdieAssistantContext, EllipsisMenu } from '@automattic/odie-client';
import { useI18n } from '@wordpress/react-i18n';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
/**
 * Internal Dependencies
 */
import { BackButtonHeader } from './back-button';
import './help-center-odie.scss';

const OdieEllipsisMenu = () => {
	const { __ } = useI18n();
	const { clearChat } = useOdieAssistantContext();

	return (
		<EllipsisMenu
			popoverClassName="help-center help-center__container-header-menu"
			position="bottom"
		>
			<PopoverMenuItem
				onClick={ clearChat }
				className="help-center help-center__container-header-menu-item"
			>
				<Gridicon icon="comment" />
				{ __( 'Clear Conversation' ) }
			</PopoverMenuItem>
		</EllipsisMenu>
	);
};

export function HelpCenterOdie(): JSX.Element {
	return (
		<div className="help-center__container-content-odie">
			<div className="help-center__container-odie-header">
				<BackButtonHeader className="help-center__container-odie-back-button">
					<OdieEllipsisMenu />
				</BackButtonHeader>
			</div>
			<OdieAssistant />
		</div>
	);
}
