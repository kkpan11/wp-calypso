import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import { PendingPostSubscription, SubscriptionManagerSubscriptionsCount } from '../types';

type PendingPostConfirmParams = {
	id: string;
};

type PendingPostConfirmResponse = {
	confirmed: boolean;
};

const usePendingPostConfirmMutation = () => {
	const isLoggedIn = useIsLoggedIn();
	const queryClient = useQueryClient();
	return useMutation(
		async ( { id }: PendingPostConfirmParams ) => {
			if ( ! id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Invalid subscription key'
				);
			}

			const response = await callApi< PendingPostConfirmResponse >( {
				path: `/post-comment-subscriptions/${ id }/confirm`,
				method: 'POST',
				apiVersion: '2',
			} );
			if ( ! response.confirmed ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while confirming subscription.'
				);
			}

			return response;
		},
		{
			onMutate: async ( { id } ) => {
				await queryClient.cancelQueries( [ 'read', 'pending-post-subscriptions', isLoggedIn ] );
				await queryClient.cancelQueries( [ 'read', 'subscriptions-count', isLoggedIn ] );

				const previousPendingPostSubscriptions = queryClient.getQueryData<
					PendingPostSubscription[]
				>( [ 'read', 'pending-post-subscriptions', isLoggedIn ] );

				// remove blog from pending post subscriptions
				if ( previousPendingPostSubscriptions ) {
					queryClient.setQueryData< PendingPostSubscription[] >(
						[ [ 'read', 'pending-post-subscriptions', isLoggedIn ] ],
						previousPendingPostSubscriptions.filter(
							( pendingPostSubscription ) => pendingPostSubscription.id !== id
						)
					);
				}

				const previousSubscriptionsCount =
					queryClient.getQueryData< SubscriptionManagerSubscriptionsCount >( [
						'read',
						'subscriptions-count',
						isLoggedIn,
					] );

				// decrement the blog count
				if ( previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						[ 'read', 'subscriptions-count', isLoggedIn ],
						{
							...previousSubscriptionsCount,
							blogs: previousSubscriptionsCount?.pending
								? previousSubscriptionsCount?.pending - 1
								: null,
						}
					);
				}

				return { previousPendingPostSubscriptions, previousSubscriptionsCount };
			},
			onError: ( error, variables, context ) => {
				if ( context?.previousPendingPostSubscriptions ) {
					queryClient.setQueryData< PendingPostSubscription[] >(
						[ 'read', 'pending-post-subscriptions', isLoggedIn ],
						context.previousPendingPostSubscriptions
					);
				}
				if ( context?.previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						[ 'read', 'subscriptions-count', isLoggedIn ],
						context.previousSubscriptionsCount
					);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries( [ 'read', 'pending-post-subscriptions', isLoggedIn ] );
				queryClient.invalidateQueries( [ 'read', 'subscriptions-count', isLoggedIn ] );
			},
		}
	);
};

export default usePendingPostConfirmMutation;
