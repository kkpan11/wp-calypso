import { FoldableCard } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export interface TaskStepItem {
	stepId: string;
	count: number;
	title: string;
	description: string;
	buttonProps?: {
		label: string;
		href: string;
		variant: 'primary' | 'secondary';
		icon?: JSX.Element;
		isExternal?: boolean;
		eventName?: string;
	};
}

export interface TaskStepItemWithCompletion extends TaskStepItem {
	isCompleted: boolean;
}

interface TaskStepProps {
	step: TaskStepItemWithCompletion;
	toggleTaskStatus: ( step: TaskStepItem ) => void;
}

interface TaskStepsProps {
	heading: string;
	subheading: string;
	steps: TaskStepItemWithCompletion[];
	sessionStorageKey: string;
}

export function TaskStep( { step, toggleTaskStatus }: TaskStepProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleOnClick = () => {
		if ( step.buttonProps?.eventName ) {
			dispatch( recordTracksEvent( step.buttonProps?.eventName ) );
		}
	};

	return (
		<FoldableCard
			className="task-step"
			header={
				<div className="task-step__header">
					{ step.isCompleted ? (
						<div className="task-step__completed">
							<Icon icon={ check } size={ 24 } />
						</div>
					) : (
						<div className="task-step__count">{ step.count }</div>
					) }
					<div className="task-step__title">{ step.title }</div>
				</div>
			}
			expanded={ ! step.isCompleted }
			clickableHeader
			summary={ false }
		>
			<div className="task-step__description">{ step.description }</div>
			<div className="task-step__button-container">
				{ step.buttonProps && (
					<Button
						target={ step.buttonProps?.isExternal ? '_blank' : undefined }
						variant={ step.buttonProps.variant }
						href={ step.buttonProps.href }
						onClick={ handleOnClick }
					>
						{ step.buttonProps.label }
						{ step.buttonProps.icon && <Icon icon={ step.buttonProps.icon } size={ 24 } /> }
					</Button>
				) }
				<Button onClick={ () => toggleTaskStatus( step ) } variant="secondary">
					{ step.isCompleted ? translate( 'Reset task' ) : translate( 'Mark as done' ) }
				</Button>
			</div>
		</FoldableCard>
	);
}

export function TaskSteps( { heading, subheading, steps, sessionStorageKey }: TaskStepsProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const updatedStepIds = JSON.parse( sessionStorage.getItem( sessionStorageKey ) || '[]' );
	const [ completedStepIds, setCompletedStepIds ] = useState< string[] >( updatedStepIds );

	const updatedSteps = steps.map( ( step ) => {
		return {
			...step,
			isCompleted: completedStepIds.includes( step.stepId ),
		};
	} );

	const toggleTaskStatus = ( step: TaskStepItem ) => {
		const checkIfTaskIsCompleted = completedStepIds.includes( step.stepId );
		const updatedStepIds = checkIfTaskIsCompleted
			? completedStepIds.filter( ( id ) => id !== step.stepId )
			: [ ...completedStepIds, step.stepId ];
		setCompletedStepIds( updatedStepIds );
		sessionStorage.setItem( sessionStorageKey, JSON.stringify( updatedStepIds ) );
		dispatch(
			recordTracksEvent(
				checkIfTaskIsCompleted
					? 'calypso_a8c_for_agencies_reset_task'
					: 'calypso_a8c_for_agencies_mark_task_as_done',
				{
					task_id: step.stepId,
				}
			)
		);
	};

	const resetAllTasks = () => {
		setCompletedStepIds( [] );
		sessionStorage.removeItem( sessionStorageKey );
		dispatch( recordTracksEvent( 'calypso_a8c_for_agencies_reset_all_tasks' ) );
	};

	return (
		<div className="task-steps">
			<div className="task-steps__header">
				<div className="task-steps__heading-container">
					<div className="task-steps__heading">{ preventWidows( heading ) }</div>
					<div className="task-steps__subheading">{ preventWidows( subheading ) }</div>
				</div>
				<Button variant="secondary" onClick={ resetAllTasks }>
					{ translate( 'Reset all tasks' ) }
				</Button>
			</div>
			<div className="task-steps__steps">
				{ updatedSteps.map( ( step ) => (
					<TaskStep key={ step.stepId } step={ step } toggleTaskStatus={ toggleTaskStatus } />
				) ) }
			</div>
		</div>
	);
}
