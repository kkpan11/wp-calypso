import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Markdown from 'react-markdown';
import { ODIE_FORWARD_TO_FORUMS_MESSAGE, ODIE_FORWARD_TO_ZENDESK_MESSAGE } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import CustomALink from './custom-a-link';
import { DirectEscalationLink } from './direct-escalation-link';
import { GetSupport } from './get-support';
import { uriTransformer } from './uri-transformer';
import WasThisHelpfulButtons from './was-this-helpful-buttons';
import type { Message } from '../../types';

export const UserMessage = ( {
	message,
	isDisliked = false,
	isMessageWithoutEscalationOption = false,
}: {
	isDisliked?: boolean;
	message: Message;
	isMessageWithoutEscalationOption?: boolean;
} ) => {
	const { isUserEligibleForPaidSupport, trackEvent, chat } = useOdieAssistantContext();

	const hasCannedResponse = message.context?.flags?.canned_response;
	const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support;
	const hasFeedback = !! message?.rating_value;
	const isBot = message.role === 'bot';
	const isConnectedToZendesk = chat?.provider === 'zendesk';
	const isPositiveFeedback =
		hasFeedback && message && message.rating_value && +message.rating_value === 1;
	const showExtraContactOptions =
		( hasFeedback && ! isPositiveFeedback ) || isRequestingHumanSupport;

	const forwardMessage = isUserEligibleForPaidSupport
		? ODIE_FORWARD_TO_ZENDESK_MESSAGE
		: ODIE_FORWARD_TO_FORUMS_MESSAGE;

	const displayMessage =
		isUserEligibleForPaidSupport && hasCannedResponse ? message.content : forwardMessage;

	const handleContactSupportClick = ( destination: string ) => {
		trackEvent( 'chat_get_support', {
			location: 'user-message',
			destination,
		} );
	};

	const renderExtraContactOptions = () => {
		const currentMessageIndex = chat.messages.findIndex(
			( msg ) => msg.message_id === message.message_id
		);
		const isLastMessage = currentMessageIndex === chat.messages.length - 1;

		return isLastMessage && <GetSupport onClickAdditionalEvent={ handleContactSupportClick } />;
	};

	const isMessageShowingDisclaimer =
		message.context?.question_tags?.inquiry_type !== 'request-for-human-support';

	const handleGuidelinesClick = () => {
		trackEvent?.( 'ai_guidelines_link_clicked' );
	};

	const renderDisclaimers = () => (
		<>
			{ ! isConnectedToZendesk && (
				<WasThisHelpfulButtons message={ message } isDisliked={ isDisliked } />
			) }

			{ ! showExtraContactOptions && <DirectEscalationLink messageId={ message.message_id } /> }

			<div className="disclaimer">
				{ createInterpolateElement(
					__(
						'Powered by Support AI. Some responses may be inaccurate. <a>Learn more</a>.',
						__i18n_text_domain__
					),
					{
						a: (
							// @ts-expect-error Children must be passed to External link. This is done by createInterpolateElement, but the types don't see that.
							<ExternalLink
								href="https://automattic.com/ai-guidelines"
								onClick={ handleGuidelinesClick }
							/>
						),
					}
				) }
			</div>
		</>
	);

	return (
		<>
			<div className="odie-chatbox-message__content">
				<Markdown
					urlTransform={ uriTransformer }
					components={ {
						a: ( props: React.ComponentProps< 'a' > ) => (
							<CustomALink { ...props } target="_blank" />
						),
					} }
				>
					{ isRequestingHumanSupport ? displayMessage : message.content }
				</Markdown>
			</div>
			{ ! isMessageWithoutEscalationOption && isBot && (
				<div className="chat-feedback-wrapper">
					{ showExtraContactOptions && renderExtraContactOptions() }
					{ isMessageShowingDisclaimer && renderDisclaimers() }
				</div>
			) }
		</>
	);
};
