import { FormInputValidation } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { ProgressBar } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { Icon, cloudUpload } from '@wordpress/icons';
import { useCallback, useState, FormEvent } from 'react';
import DropZone from 'calypso/components/drop-zone';
import FilePicker from 'calypso/components/file-picker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ImporterActionButton from '../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../importer-action-buttons/container';

type Props = {
	nextStepUrl: string;
	siteId: number;
	skipNextStep: () => void;
	cardData: any;
};

export default function SubscriberUploadForm( { nextStepUrl, siteId, skipNextStep }: Props ) {
	const [ selectedFile, setSelectedFile ] = useState< File >();

	const { importCsvSubscribers } = useDispatch( Subscriber.store );
	const { importSelector } = useSelect( ( select ) => {
		const subscriber = select( Subscriber.store );

		return {
			importSelector: subscriber.getImportSubscribersSelector(),
			imports: subscriber.getImportJobsSelector(),
		};
	}, [] );

	const [ isSelectedFileValid, setIsSelectedFileValid ] = useState( false );
	const onSubmit = useCallback(
		async ( event: FormEvent< HTMLFormElement > ) => {
			event.preventDefault();
			selectedFile && importCsvSubscribers( siteId, selectedFile, [], true );
		},
		[ siteId, selectedFile ]
	);

	const onFileSelect = useCallback( ( files: Array< File > ) => {
		const file = files[ 0 ];
		const isValid = isValidExtension( file.name );

		setIsSelectedFileValid( isValid );
		isValid && setSelectedFile( file );
	}, [] );

	function isValidExtension( fileName: string ) {
		const extensionRgx = new RegExp( /[^\\]*\.(?<extension>\w+)$/ );
		const validExtensions = [ 'csv' ];
		const match = extensionRgx.exec( fileName );

		return validExtensions.includes( match?.groups?.extension.toLowerCase() as string );
	}

	const importSubscribersUrl =
		'https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/';

	if ( importSelector?.inProgress ) {
		return (
			<div className="subscriber-upload-form__dropzone">
				<div className="subscriber-upload-form__in-progress">
					<Icon icon={ cloudUpload } viewBox="4 4 16 16" size={ 16 } />
					<p>Uploading...</p>
					<ProgressBar />
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={ onSubmit } autoComplete="off" className="subscriber-upload-form">
			{ ! isSelectedFileValid && selectedFile && (
				<FormInputValidation className="is-file-validation" isError text="">
					Sorry, you can only upload CSV files. Please try again with a valid file.
				</FormInputValidation>
			) }
			<div className="subscriber-upload-form__dropzone">
				<DropZone onFilesDrop={ onFileSelect } />
				<FilePicker accept="text/csv" onPick={ onFileSelect } multiple={ false }>
					<Icon icon={ cloudUpload } viewBox="4 4 16 16" size={ 16 } />
					{ ! selectedFile && <p>Drag a file, or click to upload a file.</p> }
					{ selectedFile && (
						<p>
							To replace this <em className="file-name">{ selectedFile?.name }</em>
							<br /> drag a file, or click to upload different one.
						</p>
					) }
				</FilePicker>
			</div>
			{ isSelectedFileValid && selectedFile && (
				<p>
					By clicking "Continue," you represent that you've obtained the appropriate consent to
					email each person. <a href={ localizeUrl( importSubscribersUrl ) }>Learn more</a>.
				</p>
			) }
			<ImporterActionButtonContainer noSpacing>
				<ImporterActionButton
					type="submit"
					primary
					onClick={ () => {
						recordTracksEvent( 'calypso_paid_importer_add_subscriber' );
					} }
					disabled={ ! ( isSelectedFileValid && selectedFile ) }
				>
					Continue
				</ImporterActionButton>
				<ImporterActionButton
					href={ nextStepUrl }
					onClick={ () => {
						skipNextStep();
						recordTracksEvent( 'calypso_paid_importer_connect_stripe_skipped' );
					} }
				>
					Skip for now
				</ImporterActionButton>
			</ImporterActionButtonContainer>
		</form>
	);
}
