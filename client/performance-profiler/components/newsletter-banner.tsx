import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const Container = styled.div`
	background:
		linear-gradient( 90deg, var( --studio-gray-100 ) 50%, rgba( 16, 21, 23, 0 ) 100% ),
		fixed 10px 10px /16px 16px radial-gradient( var( --studio-gray-50 ) 1px, transparent 0 ),
		var( --studio-gray-100 );
	border-radius: 6px;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 10px;
	justify-content: space-between;
	width: 100%;
	box-sizing: border-box;
	flex-wrap: wrap;
	padding: 24px;

	@media ( max-width: 600px ) {
		background:
			linear-gradient( 180deg, var( --studio-gray-100 ) 50%, rgba( 16, 21, 23, 0 ) 100% ),
			fixed 10px 10px /16px 16px radial-gradient( var( --studio-gray-50 ) 1px, transparent 0 ),
			var( --studio-gray-100 );
	}
`;

const Heading = styled.div`
	font-weight: 500;
	line-height: 24px;
	text-align: left;
	color: var( --studio-white );
`;

const Body = styled.div`
	color: var( --studio-gray-20 );
	text-wrap: balance;
`;

const BlueberryButton = styled( Button )`
	// && is needed for specificity
	&& {
		background: #3858e9;
		border-color: #3858e9;

		&:hover:not( :disabled ),
		&:active:not( :disabled ),
		&:focus:not( :disabled ) {
			background-color: darken( #3858e9, 10% );
			border-color: darken( #3858e9, 10% );
			box-shadow: none;
		}
	}
`;

export const NewsletterBanner = ( { link }: { link: string } ) => {
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );

	return (
		<Container>
			<div>
				<Heading>
					{ translate( 'Get notified about changes to your site’s performance—it’s free!' ) }
				</Heading>
				<Body>
					{ translate(
						"Monitor your site's key performance metrics with a free report delivered to your inbox each week."
					) }
				</Body>
				{ ! isLoggedIn && (
					<Body>
						{ translate( 'All you need is a free WordPress.com account to get started.' ) }
					</Body>
				) }
			</div>
			<BlueberryButton variant="primary" href={ link }>
				{ isLoggedIn
					? translate( 'Enable email alerts' )
					: translate( 'Sign up for email reports' ) }
			</BlueberryButton>
		</Container>
	);
};
