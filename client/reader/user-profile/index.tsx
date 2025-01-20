import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { UserData } from 'calypso/lib/user/user';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';
import UserLists from 'calypso/reader/user-profile/views/lists';
import UserPosts from 'calypso/reader/user-profile/views/posts';
import { requestUser } from 'calypso/state/reader/users/actions';
import './style.scss';

interface UserProfileProps {
	streamKey?: string;
	userId: string;
	user: UserData;
	isLoading: boolean;
	requestUser: ( userId: string ) => Promise< void >;
}

type UserProfileState = {
	reader: {
		users: {
			items: Record< string, UserData >;
			requesting: Record< string, boolean >;
		};
	};
};

export function UserProfile( props: UserProfileProps ) {
	const { userId, requestUser, user, streamKey, isLoading } = props;
	const translate = useTranslate();

	useEffect( () => {
		requestUser( userId );
	}, [ userId, requestUser ] );

	if ( isLoading ) {
		return <></>;
	}

	if ( ! user ) {
		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ translate( 'Uh oh. User not found.' ) }
				line={ translate( 'Sorry, the user you were looking for could not be found.' ) }
				action={ translate( 'Return to Reader' ) }
				actionURL="/read"
				className="user-profile__404"
			/>
		);
	}

	const currentPath = page.current;
	const userProfileUrl = getUserProfileUrl( Number( userId ) );

	const renderContent = (): React.ReactNode => {
		const basePath = currentPath.split( '?' )[ 0 ];
		switch ( basePath ) {
			case userProfileUrl:
				return <UserPosts streamKey={ streamKey as string } user={ user } />;
			case `${ userProfileUrl }/lists`:
				return <UserLists user={ user } />;
			default:
				return null;
		}
	};

	return (
		<div className="user-profile">
			<div className="user-profile__content-wrapper">
				<div className="user-profile__content">{ renderContent() }</div>
			</div>
		</div>
	);
}

export default connect(
	( state: UserProfileState, ownProps: UserProfileProps ) => ( {
		user: state.reader.users.items[ ownProps.userId ],
		isLoading: state.reader.users.requesting[ ownProps.userId ] ?? false,
	} ),
	{ requestUser }
)( UserProfile );
